import json
import os
import re
from pathlib import Path

import anthropic
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

from memory import ConversationMemory
from validator import SQLValidator

load_dotenv()

MODEL = "claude-sonnet-4-6"
_schema_path = Path(__file__).parent / "schema_config.json"


def _build_connection_string() -> str:
    server = os.getenv("DB_SERVER", r"localhost\SQLEXPRESS")
    db = os.getenv("DB_NAME", "WideWorldImportersDW")
    user = os.getenv("DB_USER", "")
    password = os.getenv("DB_PASSWORD", "")
    driver = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
    driver_enc = driver.replace(" ", "+")

    # if no user is set, fall back to Windows Authentication (trusted connection)
    if not user:
        return (
            f"mssql+pyodbc://@{server}/{db}"
            f"?driver={driver_enc}&TrustServerCertificate=yes&trusted_connection=yes"
        )

    return (
        f"mssql+pyodbc://{user}:{password}@{server}/{db}"
        f"?driver={driver_enc}&TrustServerCertificate=yes"
    )


class TextToSQLPipeline:
    def __init__(self):
        with open(_schema_path) as f:
            self.schema = json.load(f)

        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.engine = create_engine(_build_connection_string(), pool_pre_ping=True)
        self.validator = SQLValidator()
        self.memory = ConversationMemory()
        self._system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        tables_block = []
        for table_name, info in self.schema["tables"].items():
            cols = "\n".join(
                f"    - {col}: {desc}"
                for col, desc in info["columns"].items()
            )
            tables_block.append(f"Table: {table_name}\nDescription: {info['description']}\nColumns:\n{cols}")

        glossary_lines = "\n".join(
            f'  "{term}" → {mapping}'
            for term, mapping in self.schema["business_glossary"].items()
        )

        join_lines = "\n".join(
            f"  {k}: {v}" for k, v in self.schema["join_keys"].items()
        )

        few_shot = """
IMPORTANT: All column names in WideWorldImportersDW use spaces and MUST be wrapped in square brackets.
The Stock Item dimension table name also has a space: [Dimension].[Stock Item]

Examples:

Q: What are the total sales this year?
A: SELECT SUM(s.[Total Excluding Tax]) AS TotalSales
   FROM Fact.Sale s
   JOIN Dimension.Date d ON s.[Invoice Date Key] = d.[Date]
   WHERE d.[Calendar Year] = 2016

Q: Who are the top 5 salespersons by revenue?
A: SELECT TOP 5 e.[Employee], SUM(s.[Total Excluding Tax]) AS Revenue
   FROM Fact.Sale s
   JOIN Dimension.Employee e ON s.[Salesperson Key] = e.[Employee Key]
   WHERE e.[Is Salesperson] = 1
   GROUP BY e.[Employee]
   ORDER BY Revenue DESC

Q: What is the most sold product by units?
A: SELECT TOP 1 si.[Stock Item], SUM(s.[Quantity]) AS UnitsSold
   FROM Fact.Sale s
   JOIN [Dimension].[Stock Item] si ON s.[Stock Item Key] = si.[Stock Item Key]
   GROUP BY si.[Stock Item]
   ORDER BY UnitsSold DESC

Q: Show monthly revenue for 2016
A: SELECT d.[Calendar Month Label], SUM(s.[Total Excluding Tax]) AS Revenue
   FROM Fact.Sale s
   JOIN Dimension.Date d ON s.[Invoice Date Key] = d.[Date]
   WHERE d.[Calendar Year] = 2016
   GROUP BY d.[Calendar Month Label], d.[Calendar Month Number]
   ORDER BY d.[Calendar Month Number]
"""

        return f"""You are a T-SQL query generator for the WideWorldImportersDW data warehouse on SQL Server.

RULES:
- Return ONLY the SQL query. No explanation, no markdown, no code fences.
- Use T-SQL syntax: TOP instead of LIMIT, use YEAR(GETDATE()) for current year.
- CRITICAL: Every column name has spaces and MUST be wrapped in square brackets e.g. [Total Excluding Tax], [Calendar Year], [Invoice Date Key].
- CRITICAL: The product table name has a space — always write it as [Dimension].[Stock Item].
- Only reference tables from this allowlist: {self.schema['allowed_tables']}
- Always use short table aliases (s for Fact.Sale, d for Dimension.Date, e for Dimension.Employee, c for Dimension.Customer, si for [Dimension].[Stock Item]).
- Never select the [Photo] column from Dimension.Employee.
- The data covers years 2013-2016. Do not filter on YEAR(GETDATE()) — use 2016 as the most recent year.
- If the question cannot be answered from the available tables, return exactly: CANNOT_ANSWER

SCHEMA:
{chr(10).join(tables_block)}

JOIN KEYS:
{join_lines}

BUSINESS GLOSSARY:
{glossary_lines}

{few_shot}"""

    def _extract_sql(self, response_text: str) -> str:
        sql = response_text.strip()
        # strip code fences if the model added them anyway
        sql = re.sub(r"^```(?:sql)?\s*", "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"\s*```$", "", sql).strip()
        return sql

    def generate_sql(self, question: str, history: list[dict]) -> str:
        messages = history + [{"role": "user", "content": question}]

        response = self.client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=self._system_prompt,
            messages=messages,
        )
        return self._extract_sql(response.content[0].text)

    def execute_query(self, sql: str) -> list[dict]:
        with self.engine.connect() as conn:
            result = conn.execute(text(sql))
            cols = list(result.keys())
            rows = []
            for row in result:
                rows.append(dict(zip(cols, row)))
        return rows

    def generate_answer(self, question: str, sql: str, results: list[dict]) -> str:
        if not results:
            return "No data was found for that question."

        # only send first 50 rows to keep the prompt small
        sample = results[:50]
        rows_text = json.dumps(sample, indent=2, default=str)

        prompt = (
            f"The user asked: {question}\n\n"
            f"The SQL query returned these results:\n{rows_text}\n\n"
            "Write a clear, concise plain-English answer (2-4 sentences max). "
            "Include specific numbers and names from the data. Do not mention SQL."
        )

        response = self.client.messages.create(
            model=MODEL,
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text.strip()

    def get_schema(self) -> dict:
        tables = []
        for table_name, info in self.schema["tables"].items():
            columns = [
                {"name": col, "description": desc}
                for col, desc in info["columns"].items()
            ]
            tables.append({
                "name": table_name,
                "description": info["description"],
                "columns": columns,
            })
        return {"tables": tables}

    def ask(self, question: str, session_id: str) -> dict:
        history = self.memory.get(session_id)

        # generate
        sql = self.generate_sql(question, history)

        if sql == "CANNOT_ANSWER":
            return {
                "answer": "I can't answer that with the available data. Try asking about sales, revenue, customers, products, or salespersons.",
                "sql": "",
                "data": [],
                "confidence": "low",
            }

        # validate
        is_valid, clean_sql, err = self.validator.validate(sql)
        if not is_valid:
            return {
                "answer": f"The generated query didn't pass validation: {err}",
                "sql": sql,
                "data": [],
                "confidence": "low",
            }

        # execute
        try:
            data = self.execute_query(clean_sql)
        except Exception as e:
            return {
                "answer": "There was an error running the query against the database.",
                "sql": clean_sql,
                "data": [],
                "confidence": "low",
            }

        answer = self.generate_answer(question, clean_sql, data)

        # save to memory
        self.memory.add(session_id, "user", question)
        self.memory.add(session_id, "assistant", answer)

        return {
            "answer": answer,
            "sql": clean_sql,
            "data": data,
            "confidence": "high" if data else "medium",
        }

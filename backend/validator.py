import re
import json
from pathlib import Path


# load allowed tables once at module level
_config_path = Path(__file__).parent / "schema_config.json"
with open(_config_path) as f:
    _schema = json.load(f)

ALLOWED_TABLES = set(_schema["allowed_tables"])

# anything that isn't a read operation
BLOCKED_KEYWORDS = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|EXECUTE|MERGE|GRANT|REVOKE|ATTACH|DETACH)\b",
    re.IGNORECASE,
)


class SQLValidator:
    def validate(self, sql: str) -> tuple[bool, str, str]:
        """
        Returns (is_valid, cleaned_sql, error_message).
        cleaned_sql may have TOP 1000 injected if no limit was present.
        """
        sql = sql.strip()

        # strip markdown code fences if the LLM wrapped the query
        if sql.startswith("```"):
            sql = re.sub(r"^```(?:sql)?\s*", "", sql, flags=re.IGNORECASE)
            sql = re.sub(r"\s*```$", "", sql)
            sql = sql.strip()

        # rule 1 — must be a SELECT
        first_word = sql.split()[0].upper() if sql.split() else ""
        if first_word != "SELECT":
            return False, sql, "Only SELECT queries are allowed."

        # rule 2 — no write/ddl keywords
        match = BLOCKED_KEYWORDS.search(sql)
        if match:
            return False, sql, f"Blocked keyword detected: {match.group().upper()}"

        # rule 3 — semicolons = multiple statements, not allowed
        # allow a trailing semicolon but nothing after it
        stripped = sql.rstrip("; \t\n")
        if ";" in stripped:
            return False, sql, "Multiple statements are not allowed."

        # rule 4 — check table references are in the allowlist
        # handles both plain Schema.Table and [Schema].[Table with spaces]
        # plain references: 2+ char schema to avoid matching aliases like s.column
        plain_refs = re.findall(r"\b([A-Za-z]{2,})\s*\.\s*([A-Za-z][A-Za-z0-9_]*)\b", sql)
        # bracket-quoted references: [Schema].[Table Name]
        bracket_refs = re.findall(r"\[([^\]]+)\]\s*\.\s*\[([^\]]+)\]", sql)

        for schema, table in plain_refs:
            candidate = f"{schema}.{table}"
            if candidate not in ALLOWED_TABLES:
                return False, sql, f"Table not in allowlist: {candidate}"

        for schema, table in bracket_refs:
            candidate = f"{schema}.{table}"
            if candidate not in ALLOWED_TABLES:
                return False, sql, f"Table not in allowlist: {candidate}"

        # rule 5 — inject TOP 1000 if there's no row limit
        has_top = re.search(r"\bTOP\s+\d+\b", sql, re.IGNORECASE)
        has_fetch = re.search(r"\bFETCH\s+NEXT\b", sql, re.IGNORECASE)
        if not has_top and not has_fetch:
            sql = re.sub(r"(?i)^(SELECT)\s+", "SELECT TOP 1000 ", sql, count=1)

        return True, sql, ""

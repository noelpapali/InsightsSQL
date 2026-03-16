# InsightsSQL

A conversational AI chatbot that lets you query the WideWorldImportersDW data warehouse in plain English. Type a question, get an answer — the chatbot handles all the SQL.

```
┌────────────────────────────────────────────┐
│  You:  Who are the top 5 salespersons?     │
│  Bot:  The top 5 by revenue this year are  │
│        1. Amy Trefl — $1.2M               │
│        2. ...                              │
│                                            │
│  SQL:  SELECT TOP 5 e.Employee,            │
│        SUM(s.TotalExcludingTax) AS Revenue │
│        FROM Fact.Sale s ...               │
└────────────────────────────────────────────┘
```

## Stack

| Layer | Tech |
|-------|------|
| LLM | Anthropic Claude Sonnet (`claude-sonnet-4-6`) |
| Backend | FastAPI + SQLAlchemy |
| Database | SQL Server — WideWorldImportersDW |
| Frontend | React + Vite + Tailwind CSS |

## Setup

### 1. Database

Restore `WideWorldImportersDW` to SQL Server Express, then run this in SSMS:

```sql
CREATE LOGIN chatbot_user WITH PASSWORD = 'your_db_password_here';
USE WideWorldImportersDW;
CREATE USER chatbot_user FOR LOGIN chatbot_user;
GRANT SELECT ON SCHEMA::Fact TO chatbot_user;
GRANT SELECT ON SCHEMA::Dimension TO chatbot_user;
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

cp ../.env.example .env      # fill in your keys
uvicorn main:app --reload
```

The API will be at `http://localhost:8000`. Swagger docs at `/docs`.

**Environment variables** (copy `.env.example` → `.env`):

```
ANTHROPIC_API_KEY=sk-ant-...
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=WideWorldImportersDW
DB_USER=chatbot_user
DB_PASSWORD=your_db_password_here
DB_DRIVER=ODBC Driver 17 for SQL Server
```

> To find your ODBC driver name: `python -c "import pyodbc; print(pyodbc.drivers())"`

### 3. Frontend

Requires Node.js 20+. Install from https://nodejs.org

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 4. Tests

```bash
# unit tests only (no DB or API key needed)
backend/venv/Scripts/pytest tests/test_validator.py -v

# integration tests (needs live DB + API key)
backend/venv/Scripts/pytest tests/test_pipeline.py -v -m integration
```

## How it works

1. User types a question in the chat panel
2. FastAPI backend receives it and injects schema context into a Claude prompt
3. Claude generates a T-SQL query
4. The SQL validator checks it (SELECT-only, known tables, row limit)
5. SQLAlchemy runs the query against the read-only `chatbot_user` account
6. A second Claude call converts the result rows into a plain-English answer
7. The frontend displays the answer, the generated SQL, and the raw data table

## Project structure

```
InsightsSQL/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── pipeline.py          # LLM + SQL execution
│   ├── validator.py         # SQL safety checks
│   ├── schema_config.json   # Table metadata + glossary
│   ├── memory.py            # Per-session chat history
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── ChatPanel.jsx
│       ├── SqlInspector.jsx
│       └── ResultsTable.jsx
├── tests/
│   ├── test_validator.py
│   └── test_pipeline.py
└── sample_questions.md
```

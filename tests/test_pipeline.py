"""
Integration tests — require a live DB connection and ANTHROPIC_API_KEY.
Run with: pytest tests/test_pipeline.py -m integration
"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))


@pytest.mark.integration
def test_db_connection():
    from pipeline import TextToSQLPipeline
    p = TextToSQLPipeline()
    # simple sanity check — if the engine connects this won't throw
    with p.engine.connect() as conn:
        from sqlalchemy import text
        result = conn.execute(text("SELECT TOP 1 TotalExcludingTax FROM Fact.Sale"))
        rows = result.fetchall()
    assert len(rows) == 1
    assert rows[0][0] is not None


@pytest.mark.integration
def test_full_ask():
    from pipeline import TextToSQLPipeline
    p = TextToSQLPipeline()
    result = p.ask("What are the total sales?", session_id="test-session")
    assert result["answer"]
    assert result["sql"].strip().upper().startswith("SELECT")
    assert isinstance(result["data"], list)

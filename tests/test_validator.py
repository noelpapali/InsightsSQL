import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from validator import SQLValidator

v = SQLValidator()


def test_simple_select_passes():
    ok, sql, err = v.validate("SELECT TOP 10 * FROM Fact.Sale")
    assert ok
    assert err == ""


def test_insert_blocked():
    ok, _, err = v.validate("INSERT INTO Fact.Sale VALUES (1, 2, 3)")
    assert not ok
    assert err  # just check there's an error message


def test_update_blocked():
    ok, _, err = v.validate("UPDATE Fact.Sale SET Quantity = 99")
    assert not ok


def test_drop_blocked():
    ok, _, err = v.validate("DROP TABLE Fact.Sale")
    assert not ok


def test_exec_blocked():
    ok, _, err = v.validate("EXEC sp_who")
    assert not ok


def test_non_select_blocked():
    ok, _, err = v.validate("MERGE INTO Fact.Sale USING ...")
    assert not ok


def test_unknown_table_blocked():
    ok, _, err = v.validate("SELECT * FROM dbo.SomeOtherTable")
    assert not ok
    assert "allowlist" in err.lower()


def test_allowed_tables_pass():
    sql = """
    SELECT TOP 5 e.[Employee], SUM(s.[Total Excluding Tax]) AS Rev
    FROM Fact.Sale s
    JOIN Dimension.Employee e ON s.[Salesperson Key] = e.[Employee Key]
    WHERE e.[Is Salesperson] = 1
    GROUP BY e.[Employee]
    ORDER BY Rev DESC
    """
    ok, _, err = v.validate(sql)
    assert ok, err


def test_stock_item_bracket_table_passes():
    sql = """
    SELECT TOP 10 si.[Stock Item], SUM(s.[Quantity]) AS Units
    FROM Fact.Sale s
    JOIN [Dimension].[Stock Item] si ON s.[Stock Item Key] = si.[Stock Item Key]
    GROUP BY si.[Stock Item]
    ORDER BY Units DESC
    """
    ok, _, err = v.validate(sql)
    assert ok, err


def test_top_injected_when_missing():
    ok, clean_sql, _ = v.validate("SELECT * FROM Fact.Sale")
    assert ok
    assert "TOP 1000" in clean_sql.upper()


def test_top_not_duplicated_when_present():
    ok, clean_sql, _ = v.validate("SELECT TOP 5 * FROM Fact.Sale")
    assert ok
    assert clean_sql.upper().count("TOP") == 1


def test_semicolon_blocked():
    ok, _, err = v.validate("SELECT * FROM Fact.Sale; DROP TABLE Fact.Sale")
    assert not ok


def test_trailing_semicolon_ok():
    # a lone trailing semicolon should be fine
    ok, _, err = v.validate("SELECT TOP 10 * FROM Fact.Sale;")
    assert ok


def test_markdown_fences_stripped():
    sql = "```sql\nSELECT TOP 1 * FROM Fact.Sale\n```"
    ok, clean_sql, err = v.validate(sql)
    assert ok, err
    assert "```" not in clean_sql


def test_empty_query_blocked():
    ok, _, err = v.validate("")
    assert not ok

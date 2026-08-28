import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8001";

// icon per table type
function TableIcon({ name }) {
  if (name.startsWith("Fact")) {
    return <span title="Fact table" className="text-yellow-400 text-xs font-bold">F</span>;
  }
  return <span title="Dimension table" className="text-blue-400 text-xs font-bold">D</span>;
}

export default function SchemaPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${API}/schema`)
      .then((res) => {
        setTables(res.data.tables);
        setSelected(res.data.tables[0] ?? null);
      })
      .catch(() => setError("Could not load schema. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1e56] flex flex-col font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-[#0a1540] border-b border-[#1e3a8a]/40 shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">IQ</div>
            <span className="text-white font-semibold text-lg tracking-tight">InsightsSQL</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-blue-300 hover:text-white text-sm transition-colors px-3 py-1.5"
            >
              ← Home
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Chatting →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page header ── */}
      <div className="bg-[#0a1540] border-b border-[#1e3a8a]/40 px-6 py-5 shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white text-xl font-bold">Database Explorer</h1>
          <p className="text-blue-300/70 text-sm mt-0.5">
            WideWorldImportersDW · {tables.length} tables available
          </p>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden max-w-7xl w-full mx-auto">

        {/* ── Left sidebar — table list ── */}
        <aside className="w-64 shrink-0 border-r border-[#1e3a8a]/40 flex flex-col bg-[#0a1540]">
          <div className="px-4 pt-4 pb-2">
            <p className="text-blue-300/50 text-[10px] uppercase tracking-widest font-semibold">Tables</p>
          </div>

          {loading && (
            <div className="px-4 py-6 text-blue-300/50 text-sm">Loading...</div>
          )}
          {error && (
            <div className="px-4 py-3 text-red-400 text-xs">{error}</div>
          )}

          <ul className="flex-1 overflow-y-auto pb-4">
            {tables.map((t) => (
              <li key={t.name}>
                <button
                  onClick={() => setSelected(t)}
                  className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                    selected?.name === t.name
                      ? "bg-blue-600/20 text-white border-r-2 border-blue-500"
                      : "text-blue-200 hover:bg-[#132057] hover:text-white"
                  }`}
                >
                  {/* SSMS-style table icon */}
                  <svg className="w-4 h-4 shrink-0 text-blue-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
                  </svg>
                  <span className="truncate">{t.name}</span>
                  <TableIcon name={t.name} />
                </button>
              </li>
            ))}
          </ul>

          {/* legend */}
          <div className="px-4 py-3 border-t border-[#1e3a8a]/40 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-blue-300/50">
              <span className="text-yellow-400 font-bold text-xs">F</span> Fact table
            </div>
            <div className="flex items-center gap-2 text-[11px] text-blue-300/50">
              <span className="text-blue-400 font-bold text-xs">D</span> Dimension table
            </div>
          </div>
        </aside>

        {/* ── Right panel — schema detail ── */}
        <main className="flex-1 overflow-y-auto">
          {!selected && !loading && (
            <div className="flex items-center justify-center h-full text-blue-300/40 text-sm">
              Select a table to view its schema
            </div>
          )}

          {selected && (
            <div className="p-6">
              {/* table header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
                  </svg>
                  <h2 className="text-white text-xl font-bold">{selected.name}</h2>
                  <TableIcon name={selected.name} />
                </div>
                <p className="text-blue-300/70 text-sm ml-8">{selected.description}</p>
              </div>

              {/* columns section header */}
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-blue-300/50 text-xs uppercase tracking-widest font-semibold">
                  Columns ({selected.columns.length})
                </span>
              </div>

              {/* columns table — SSMS style */}
              <div className="bg-[#0a1540] border border-[#1e3a8a]/50 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e3a8a]/50 bg-[#0d1e56]/60">
                      <th className="text-left px-5 py-3 text-blue-300/60 text-xs font-semibold uppercase tracking-wider w-8">#</th>
                      <th className="text-left px-5 py-3 text-blue-300/60 text-xs font-semibold uppercase tracking-wider">Column Name</th>
                      <th className="text-left px-5 py-3 text-blue-300/60 text-xs font-semibold uppercase tracking-wider">Description / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.columns.map((col, i) => {
                      const isKey = col.name.toLowerCase().includes("key");
                      const isFK = col.description.toLowerCase().startsWith("fk");
                      const isPK = col.description.toLowerCase().includes("primary key");
                      return (
                        <tr
                          key={col.name}
                          className={`border-b border-[#1e3a8a]/30 transition-colors hover:bg-[#132057]/50 ${
                            i % 2 === 0 ? "" : "bg-[#0d1e56]/30"
                          }`}
                        >
                          <td className="px-5 py-3 text-blue-300/30 text-xs">{i + 1}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {isPK && (
                                <span title="Primary Key" className="text-yellow-400 text-xs shrink-0">🔑</span>
                              )}
                              {isFK && !isPK && (
                                <span title="Foreign Key" className="text-blue-400 text-xs shrink-0">🔗</span>
                              )}
                              {!isPK && !isFK && (
                                <span className="w-4 shrink-0" />
                              )}
                              <code className="text-blue-100 font-mono text-xs bg-[#132057] px-2 py-0.5 rounded">
                                {col.name}
                              </code>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-blue-300/70 text-xs leading-relaxed">
                            {col.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* hint */}
              <div className="mt-4 flex items-start gap-2 text-xs text-blue-300/40">
                <span>💡</span>
                <span>
                  Column names with spaces must be wrapped in square brackets in T-SQL queries, e.g.{" "}
                  <code className="font-mono text-blue-300/60">[{selected.columns[1]?.name.replace(/[\[\]]/g, "")}]</code>
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

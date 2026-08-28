import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatPanel from "../ChatPanel";
import SqlInspector from "../SqlInspector";
import ResultsTable from "../ResultsTable";

const API = "http://localhost:8001";
const SESSION_ID = crypto.randomUUID();

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [sql, setSql] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(question) {
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const { data: res } = await axios.post(`${API}/ask`, {
        question,
        session_id: SESSION_ID,
      });
      setSql(res.sql || "");
      setData(res.data || []);
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Something went wrong. Make sure the backend is running.";
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-[#0d1e56] text-slate-100 flex flex-col font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-[#0a1540] border-b border-[#1e3a8a]/40 shrink-0">
        <div className="max-w-full px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">IQ</div>
            <span className="text-white font-semibold tracking-tight">InsightsSQL</span>
          </button>
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => navigate("/schema")}
              className="text-blue-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#132057] transition-colors"
            >
              Schema Explorer
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-blue-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#132057] transition-colors"
            >
              ← Home
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* chat — left 55% */}
        <div className="flex flex-col border-r border-[#1e3a8a]/40 overflow-hidden" style={{ width: "55%" }}>
          <ChatPanel messages={messages} loading={loading} onSend={handleSend} />
        </div>

        {/* sql inspector — right 45% */}
        <div className="flex flex-col overflow-hidden" style={{ width: "45%" }}>
          <SqlInspector sql={sql} />
        </div>
      </div>

      {/* ── Results table — bottom drawer ── */}
      {data.length > 0 && (
        <div className="border-t border-[#1e3a8a]/40 bg-[#0a1540] shrink-0">
          <div className="px-5 pt-3 pb-1 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider">
              Query Results
            </h2>
            <span className="text-xs text-blue-300/40">{data.length} row{data.length !== 1 ? "s" : ""}</span>
          </div>
          <ResultsTable data={data} />
        </div>
      )}
    </div>
  );
}

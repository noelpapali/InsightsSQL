import { useState } from "react";
import axios from "axios";
import ChatPanel from "./ChatPanel";
import SqlInspector from "./SqlInspector";
import ResultsTable from "./ResultsTable";

const API = "http://localhost:8000";

// generate a stable session id for this browser tab
const SESSION_ID = crypto.randomUUID();

export default function App() {
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
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-slate-700 shrink-0">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
          IQ
        </div>
        <div>
          <h1 className="text-sm font-semibold">InsightsSQL</h1>
          <p className="text-xs text-slate-500">Ask questions about your sales data</p>
        </div>
      </header>

      {/* main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* chat — left */}
        <div className="flex flex-col w-1/2 border-r border-slate-700 overflow-hidden">
          <ChatPanel messages={messages} loading={loading} onSend={handleSend} />
        </div>

        {/* sql inspector — right */}
        <div className="flex flex-col w-1/2 overflow-hidden">
          <SqlInspector sql={sql} />
        </div>
      </div>

      {/* results table — bottom */}
      {data.length > 0 && (
        <div className="border-t border-slate-700 bg-slate-800/50 shrink-0">
          <div className="px-4 pt-3 pb-1">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Query Results
            </h2>
          </div>
          <ResultsTable data={data} />
        </div>
      )}
    </div>
  );
}

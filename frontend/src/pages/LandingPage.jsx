import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "💬",
    title: "Natural Language Queries",
    desc: "Ask questions in plain English, no SQL knowledge required. Type like you're asking a colleague and get instant, accurate answers from your data warehouse.",
  },
  {
    icon: "🔍",
    title: "Live SQL Inspector",
    desc: "Every answer comes with the exact T-SQL query that was generated and executed. Full transparency into how your question became a database query.",
  },
  {
    icon: "🧠",
    title: "Conversation Memory",
    desc: "Ask follow-up questions naturally. The assistant remembers context across the conversation, so you can drill down without repeating yourself.",
  },
];

const steps = [
  { num: "01", title: "Type your question", desc: "Ask anything about sales, revenue, customers, or products in plain English." },
  { num: "02", title: "AI generates SQL", desc: "Our AI model translates your question into optimised T-SQL against WideWorldImportersDW." },
  { num: "03", title: "See results instantly", desc: "Get a plain-English answer, the full SQL query, and a data table in one view." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-[#0a1540] border-b border-[#1e3a8a]/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">IQ</div>
            <span className="text-white font-semibold text-lg tracking-tight">InsightsSQL</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-200">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <button
              onClick={() => navigate("/schema")}
              className="hover:text-white transition-colors"
            >
              Schema
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-[#0d1e56] relative overflow-hidden">
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16">
          {/* left copy */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Ask Your Data<br />
              <span className="text-blue-400">Anything.</span>
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed mb-4 max-w-lg">
              Most businesses sit on mountains of data but lack the SQL expertise to unlock it.
              InsightsSQL bridges that gap, turning plain English questions into live database queries in seconds.
            </p>
            <p className="text-blue-300/50 text-xs mb-10 max-w-lg tracking-wide">
              Built on <span className="text-blue-300/70 font-medium">WideWorldImportersDW</span> &nbsp;·&nbsp; Sales, Customers, Products &amp; Employees &nbsp;·&nbsp; 2013–2016
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => navigate("/chat")}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-900/50"
              >
                Start Chatting →
              </button>
              <button
                onClick={() => navigate("/schema")}
                className="bg-[#1a2f6b] hover:bg-[#1e3a80] border border-blue-700/50 text-blue-200 hover:text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-colors"
              >
                Explore Database
              </button>
            </div>
          </div>

          {/* right — mock chat window */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-[#0a1540] border border-[#1e3a8a]/60 rounded-2xl overflow-hidden shadow-2xl">
              {/* window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e3a8a]/40">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-blue-300/50 text-xs">InsightsSQL · Chat</span>
              </div>
              {/* mock messages */}
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-3.5 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                    Who are the top 5 salespersons by revenue?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#132057] text-blue-100 px-3.5 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                    The top salesperson is <span className="text-blue-300 font-medium">Amy Trefl</span> with $3.2M in revenue, followed by Hudson Onslow and Jack Potter...
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-3.5 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                    What was Amy's profit margin?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#132057] text-blue-100 px-3.5 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                    <div className="flex gap-1 items-center py-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>
              {/* mock input */}
              <div className="px-4 pb-4">
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#132057] border border-blue-800/40 rounded-lg px-3 py-2 text-blue-400/50 text-xs">
                    Ask a question about your data...
                  </div>
                  <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium">Ask</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-[#eef2ff] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0d1e56] mb-3">Why InsightsSQL?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              In today's data-driven world, waiting days for a BI report is too slow.
              InsightsSQL puts self-service analytics directly in the hands of anyone who can ask a question.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-[#0d1e56] font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-[#0d1e56] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-blue-300/70 max-w-xl mx-auto text-sm">Three steps from question to insight.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-blue-700/50" />
                )}
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-5">
                  {s.num}
                </div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-blue-300/70 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Ready to explore your data?</h2>
            <p className="text-blue-100 text-sm">No SQL. No BI tools. Just questions and answers.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => navigate("/schema")}
              className="bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Browse Schema
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl text-sm font-bold transition-colors"
            >
              Start Chatting →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

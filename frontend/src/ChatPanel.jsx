import { useEffect, useRef } from "react";

function renderMessage(text) {
  // split on **bold** markers and render alternating normal/bold segments
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // preserve line breaks
    return part.split("\n").map((line, j, arr) => (
      j < arr.length - 1 ? [line, <br key={`${i}-${j}`} />] : line
    ));
  });
}

const SAMPLE_QUESTIONS = [
  "Who are the top 5 salespersons by revenue?",
  "What is the total profit across all time?",
  "Show me monthly revenue for 2016.",
  "Which customers have spent the most with us?",
];

export default function ChatPanel({ messages, loading, onSend }) {
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSubmit(e) {
    e.preventDefault();
    const q = inputRef.current.value.trim();
    if (!q || loading) return;
    inputRef.current.value = "";
    onSend(q);
  }

  return (
    <div className="flex flex-col h-full">
      {/* message list */}
      <div className="flex-1 overflow-y-auto chat-scroll px-5 py-5 space-y-4">

        {/* empty state with sample questions */}
        {messages.length === 0 && (
          <div className="mt-6 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-white font-semibold text-base mb-1">Ask your data anything</p>
              <p className="text-blue-300/60 text-xs">Try one of these to get started:</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  disabled={loading}
                  className="text-left bg-[#0a1540] hover:bg-[#132057] border border-[#1e3a8a]/50 hover:border-blue-500/50 text-blue-200 hover:text-white text-xs px-4 py-2.5 rounded-xl transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-[#1e3a8a] border border-blue-500/30 text-white rounded-bl-sm shadow-md"
              }`}
            >
              {msg.role === "assistant" ? renderMessage(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1e3a8a] border border-blue-500/30 px-4 py-3 rounded-2xl rounded-bl-sm shadow-md">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-4 border-t border-[#1e3a8a]/40"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask a question about your data..."
          disabled={loading}
          className="flex-1 bg-[#0a1540] border border-[#1e3a8a]/50 text-white placeholder-blue-300/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Ask
        </button>
      </form>
    </div>
  );
}

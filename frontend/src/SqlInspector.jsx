import { useState } from "react";

export default function SqlInspector({ sql }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* panel header — VS Code style tab */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e3a8a]/40 bg-[#0a1540] shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider">SQL Inspector</span>
        </div>
        {sql && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-blue-300/50 hover:text-blue-200 transition-colors px-2 py-1 rounded hover:bg-[#132057]"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* content */}
      <div className="flex-1 overflow-auto p-4">
        {!sql ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <svg className="w-10 h-10 text-blue-900/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            <p className="text-blue-900/60 text-sm">Generated SQL will appear here</p>
          </div>
        ) : (
          <pre className="bg-[#020817] border border-[#1e3a8a]/30 text-green-400 text-xs p-5 rounded-xl overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
            {sql}
          </pre>
        )}
      </div>
    </div>
  );
}

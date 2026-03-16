import { useState } from "react";

export default function SqlInspector({ sql }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!sql) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            SQL Inspector
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-600 text-sm">Generated SQL will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          SQL Inspector
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
        >
          {collapsed ? "expand" : "collapse"}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-auto">
          <pre className="bg-slate-950 text-green-400 text-xs p-4 rounded-lg overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
            {sql}
          </pre>
        </div>
      )}
    </div>
  );
}

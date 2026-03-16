export default function ResultsTable({ data }) {
  if (!data || data.length === 0) return null;

  const cols = Object.keys(data[0]);

  function formatValue(val) {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") {
      return val % 1 === 0 ? val.toLocaleString() : val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return String(val);
  }

  return (
    <div className="overflow-auto max-h-64">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="border-b border-slate-700">
            {cols.map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-slate-800 ${
                i % 2 === 0 ? "" : "bg-slate-800/40"
              } hover:bg-slate-700/40 transition-colors`}
            >
              {cols.map((col) => (
                <td
                  key={col}
                  className="px-4 py-2 text-slate-300 whitespace-nowrap"
                >
                  {formatValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-slate-600 text-xs px-4 py-2">
        {data.length} row{data.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

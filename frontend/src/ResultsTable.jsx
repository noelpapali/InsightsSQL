export default function ResultsTable({ data }) {
  if (!data || data.length === 0) return null;

  const cols = Object.keys(data[0]);

  function formatValue(val) {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") {
      return val % 1 === 0
        ? val.toLocaleString()
        : val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return String(val);
  }

  return (
    <div className="overflow-auto max-h-60">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="border-b border-[#1e3a8a]/50 bg-[#0d1e56]/40">
            {cols.map((col) => (
              <th
                key={col}
                className="px-5 py-2.5 text-blue-300/60 font-semibold uppercase tracking-wider whitespace-nowrap"
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
              className={`border-b border-[#1e3a8a]/20 hover:bg-[#132057]/50 transition-colors ${
                i % 2 === 0 ? "" : "bg-[#0d1e56]/20"
              }`}
            >
              {cols.map((col) => (
                <td key={col} className="px-5 py-2 text-blue-200 whitespace-nowrap">
                  {formatValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

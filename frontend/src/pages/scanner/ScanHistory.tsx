import { useState } from "react";
import { scanHistory } from "../../lib/scannerMockData";

const filters = ["All", "Valid", "Rejected"];

const resultLabel: Record<string, string> = {
  valid: "\u2713 Valid",
  duplicate: "\u2715 Duplicate",
  invalid: "\u2715 Invalid",
  wrong_event: "\u2715 Wrong Event",
  expired: "\u2715 Expired",
  transferred: "\u2715 Transferred",
};

const resultColor: Record<string, string> = {
  valid: "text-[#16A34A]",
  duplicate: "text-[#DC2626]",
  invalid: "text-[#DC2626]",
  wrong_event: "text-[#DC2626]",
  expired: "text-[#DC2626]",
  transferred: "text-[#DC2626]",
};

export default function ScanHistory() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = scanHistory
    .filter((entry) => {
      if (activeFilter === "Valid") return entry.result === "valid";
      if (activeFilter === "Rejected") return entry.result !== "valid";
      return true;
    })
    .filter((entry) => {
      const query = search.toLowerCase();
      return (
        entry.ticketId.toLowerCase().includes(query) ||
        entry.attendeeName.toLowerCase().includes(query)
      );
    });

  return (
    <div>
      <h2 className="text-xl font-bold text-[#1E293B]">Scan History</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search ticket..."
        className="mt-4 w-full max-w-sm rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
      />

      <div className="mt-3 flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Attendee</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#64748B]">
                  No scans yet this session.
                </td>
              </tr>
            ) : (
              filtered.map((entry, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium text-[#1E293B]">{entry.ticketId}</td>
                  <td className="px-4 py-3 text-[#64748B]">{entry.attendeeName}</td>
                  <td className="px-4 py-3 text-[#64748B]">{entry.time}</td>
                  <td className={`px-4 py-3 font-medium ${resultColor[entry.result]}`}>
                    {resultLabel[entry.result]}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

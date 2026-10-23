
import { useCallback, useEffect, useState } from "react";
import {
  getScannerScanHistory,
  type ScanHistoryEntry,
} from "../../features/checkin/api/checkinApi";

const filters = ["All", "Valid", "Rejected"];

const resultLabel: Record<string, string> = {
  valid: "✓ Valid",
  duplicate: "✕ Duplicate",
  invalid: "✕ Invalid",
  wrong_event: "✕ Wrong Event",
  expired: "✕ Expired",
  transferred: "✕ Transferred",
};

const resultColor: Record<string, string> = {
  valid: "text-[#16A34A]",
  duplicate: "text-[#DC2626]",
  invalid: "text-[#DC2626]",
  wrong_event: "text-[#DC2626]",
  expired: "text-[#DC2626]",
  transferred: "text-[#DC2626]",
};

function formatScanTime(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ScanHistory() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const history = await getScannerScanHistory();
      setEntries(history);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load scan history.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const query = search.trim().toLowerCase();

  const filtered = entries
    .filter((entry) => {
      if (activeFilter === "Valid") {
        return entry.result === "valid";
      }

      if (activeFilter === "Rejected") {
        return entry.result !== "valid";
      }

      return true;
    })
    .filter(
      (entry) =>
        entry.ticketId.toLowerCase().includes(query) ||
        entry.attendeeName.toLowerCase().includes(query) ||
        entry.eventName.toLowerCase().includes(query),
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B]">
            Scan History
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            View successful ticket check-ins for your assigned events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadHistory()}
          disabled={loading}
          className="rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search ticket, attendee, or event..."
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

      {error && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadHistory()}
            className="font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Attendee</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Result</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[#64748B]"
                >
                  Loading scan history...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[#64748B]"
                >
                  Scan history could not be loaded.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[#64748B]"
                >
                  {entries.length === 0
                    ? "No successful scans found for your assigned events."
                    : "No scans match your search or filter."}
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 font-medium text-[#1E293B]">
                    {entry.ticketId}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {entry.attendeeName}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {entry.eventName}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {formatScanTime(entry.checkedInAt)}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      resultColor[entry.result] ?? "text-[#64748B]"
                    }`}
                  >
                    {resultLabel[entry.result] ?? entry.result}
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

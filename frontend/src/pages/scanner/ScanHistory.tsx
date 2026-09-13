import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScannerTopBar } from "../../components/scanner/ScannerTopBar";
import { ScanHistoryTable } from "../../components/scanner/ScanHistoryTable";
import { useScanner } from "../../context/ScannerContext";

type Filter = "all" | "valid" | "rejected";

export function ScanHistory() {
  const { selectedEvent, selectedGate, history } = useScanner();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return history.filter((h) => {
      if (filter === "valid" && h.result !== "valid") return false;
      if (filter === "rejected" && h.result === "valid") return false;
      if (query) {
        const q = query.toLowerCase();
        if (!h.code.toLowerCase().includes(q) && !h.attendee.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [history, filter, query]);

  if (!selectedEvent || !selectedGate) {
    navigate("/scanner", { replace: true });
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <ScannerTopBar
        title="Scan history"
        subtitle={`${selectedGate.name} \u00b7 ${selectedEvent.name}`}
        onBack={() => navigate(-1)}
      />

      <div className="flex-1 space-y-3 px-4 py-5 sm:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticket or attendee"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "valid", "rejected"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize ${
                filter === f
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <ScanHistoryTable entries={filtered} />
      </div>
    </div>
  );
}

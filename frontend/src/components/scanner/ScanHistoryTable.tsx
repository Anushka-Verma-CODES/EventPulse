import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { ScanHistoryEntry } from "../../types/scanner";

interface ScanHistoryTableProps {
  entries: ScanHistoryEntry[];
}

export function ScanHistoryTable({ entries }: ScanHistoryTableProps) {
  if (entries.length === 0) {
    return <div className="py-10 text-center text-sm text-gray-400">No scans match.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((h, i) => {
        const isValid = h.result === "valid";
        const label = isValid ? "Valid" : h.result === "duplicate" ? "Duplicate" : "Rejected";
        return (
          <div
            key={`${h.code}-${i}`}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <div className="truncate font-mono text-sm text-gray-900">{h.code}</div>
              <div className="truncate text-xs text-gray-500">{h.attendee}</div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div
                className={`flex items-center justify-end gap-1 text-xs font-medium ${
                  isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {isValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {label}
              </div>
              <div className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" /> {h.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

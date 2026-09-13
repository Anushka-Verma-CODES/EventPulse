import type { ScanHistoryEntry } from "../../types/scanner";

interface ScannerStatBarProps {
  history: ScanHistoryEntry[];
  gateName: string;
}

export function ScannerStatBar({ history, gateName }: ScannerStatBarProps) {
  const valid = history.filter((h) => h.result === "valid").length;
  const rejected = history.length - valid;

  const stats = [
    { label: "Checked in", value: valid },
    { label: "Rejected", value: rejected },
    { label: "Gate", value: gateName },
  ];

  return (
    <div className="flex border-t border-gray-200 bg-white">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex-1 py-3 text-center ${i < stats.length - 1 ? "border-r border-gray-200" : ""}`}
        >
          <div className="text-base font-semibold text-gray-900">{s.value}</div>
          <div className="text-xs text-gray-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

import { History, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScannerTopBar } from "../../components/scanner/ScannerTopBar";
import { ScanResultCard } from "../../components/scanner/ScanResultCard";
import { useScanner } from "../../context/ScannerContext";

export function ScanResultPage() {
  const { selectedEvent, selectedGate, lastResult } = useScanner();
  const navigate = useNavigate();

  // Direct navigation here without a scan in progress - send back to the gate.
  if (!selectedEvent || !selectedGate || !lastResult) {
    navigate("/scanner", { replace: true });
    return null;
  }

  const isPositive = lastResult.type === "valid" || lastResult.type === "duplicate";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <ScannerTopBar
        title={selectedEvent.name}
        subtitle={selectedGate.name}
        right={
          <button
            onClick={() => navigate("/scanner/history")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Scan history"
          >
            <History className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex-1 space-y-5 px-4 py-5 sm:px-6">
        <ScanResultCard result={lastResult} event={selectedEvent} gate={selectedGate} />

        <button
          onClick={() => navigate(`/scanner/event/${selectedEvent.id}/gate/${selectedGate.id}`)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <ScanLine className="h-4 w-4" />
          {isPositive ? "Scan next ticket" : "Scan again"}
        </button>
      </div>
    </div>
  );
}

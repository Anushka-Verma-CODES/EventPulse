import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScannerTopBar } from "../../components/scanner/ScannerTopBar";
import { useScanner } from "../../context/ScannerContext";

export function SelectGate() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, selectedEvent, selectEvent, selectGate } = useScanner();
  const navigate = useNavigate();

  // Supports direct navigation/refresh on this URL, not just clicking through from Home.
  useEffect(() => {
    if (eventId && selectedEvent?.id !== eventId) selectEvent(eventId);
  }, [eventId, selectedEvent, selectEvent]);

  const event = selectedEvent ?? events.find((e) => e.id === eventId);
  if (!event) return null;

  const handleSelect = (gateId: string) => {
    selectGate(gateId);
    navigate(`/scanner/event/${event.id}/gate/${gateId}`);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <ScannerTopBar title={event.name} subtitle="Select a gate" onBack={() => navigate("/scanner")} />

      <div className="flex-1 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-3">
          {event.gates.map((gate) => {
            const busy = gate.status === "Busy";
            return (
              <div key={gate.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{gate.name}</div>
                    <div className="mt-1 text-sm text-gray-500">{gate.label}</div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${busy ? "text-amber-600" : "text-green-600"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${busy ? "bg-amber-500" : "bg-green-500"}`} />
                    {gate.status}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">{gate.entries} entries so far</div>
                <button
                  onClick={() => handleSelect(gate.id)}
                  className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Start scanning
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

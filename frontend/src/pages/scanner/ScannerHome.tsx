import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScannerTopBar } from "../../components/scanner/ScannerTopBar";
import { useScanner } from "../../context/ScannerContext";

export function ScannerHome() {
  const { events, staff, selectEvent } = useScanner();
  const navigate = useNavigate();

  const handleSelect = (eventId: string) => {
    selectEvent(eventId);
    navigate(`/scanner/event/${eventId}`);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <ScannerTopBar title="EventPulse Scanner" subtitle={staff.name} />

      <div className="flex-1 px-4 py-5 sm:px-6">
        <p className="mb-4 text-sm text-gray-500">Select an event to begin scanning</p>

        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-base font-semibold text-gray-900">{event.name}</div>
              <div className="mt-1 text-sm text-gray-500">
                {event.date} &middot; {event.venue}
              </div>
              <button
                onClick={() => handleSelect(event.id)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-gray-50 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Select event
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

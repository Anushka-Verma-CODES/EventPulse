import { Link, useParams, Navigate } from "react-router-dom";
import { scannerEvents, gatesByEvent } from "../../lib/scannerMockData";

const statusColor: Record<string, string> = {
  Normal: "text-[#16A34A]",
  Busy: "text-[#D97706]",
};

export default function GateSelector() {
  const { eventId } = useParams();
  const event = scannerEvents.find((e) => e.id === eventId);
  const gates = eventId ? gatesByEvent[eventId] ?? [] : [];

  if (!event) return <Navigate to="/scanner" replace />;

  return (
    <div>
      <Link to="/scanner" className="text-sm font-medium text-[#2563EB] hover:underline">
        &larr; Back
      </Link>

      <h2 className="mt-2 text-xl font-bold text-[#1E293B]">{event.name}</h2>
      <p className="mt-1 text-sm font-medium text-[#64748B]">Select Gate</p>

      <div className="mt-4 flex flex-col gap-3">
        {gates.map((gate) => (
          <Link
            key={gate.id}
            to={`/scanner/event/${event.id}/gate/${gate.id}`}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md active:translate-y-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-[#1E293B]">{gate.name}</div>
                <div className="text-sm text-[#64748B]">{gate.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#64748B]">{gate.entries} entries</div>
                <div className={`flex items-center justify-end gap-1.5 text-sm font-medium ${statusColor[gate.status]}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {gate.status}
                </div>
              </div>
            </div>
            <span className="mt-4 inline-block rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white">
              Start Scanning
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

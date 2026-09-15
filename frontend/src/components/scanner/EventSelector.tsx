import { Link } from "react-router-dom";
import { scannerEvents } from "../../lib/scannerMockData";

export default function EventSelector() {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1E293B]">EventPulse Scanner</h2>
      <p className="mt-1 text-sm text-[#64748B]">Scan attendee tickets quickly and securely.</p>

      <div className="mt-6 text-xs font-semibold tracking-wide text-[#94A3B8]">
        SELECT EVENT
      </div>
      <div className="mt-2 flex flex-col gap-3">
        {scannerEvents.map((event) => (
          <Link
            key={event.id}
            to={`/scanner/event/${event.id}`}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md active:translate-y-0"
          >
            <div className="text-lg font-semibold text-[#1E293B]">{event.name}</div>
            <div className="mt-1 text-sm text-[#64748B]">
              {event.date} &bull; {event.venue}
            </div>
            <span className="mt-3 inline-block rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white">
              Select Event
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

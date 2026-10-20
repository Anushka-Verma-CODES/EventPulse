
import type { EventItem } from "../../types/event";

type EventOverviewProps = {
  event: EventItem;
};

type EventWithTimes = EventItem & {
  startDate?: string;
  endDate?: string;
};

function formatDateTime(date?: string) {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function EventOverview({ event }: EventOverviewProps) {
  const eventWithTimes = event as EventWithTimes;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1E293B]">
        About the Event
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
        {event.fullDescription || event.shortDescription}
      </p>

      <h3 className="mt-5 text-sm font-semibold text-[#1E293B]">
        Event Highlights
      </h3>

      <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[#64748B]">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-[#2563EB]">&bull;</span>
          {event.category} event
        </li>

        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-[#2563EB]">&bull;</span>
          Capacity of {event.capacityTotal.toLocaleString()} attendees
        </li>

        <li className="flex items-start gap-2">
          <span className="mt-0.5 text-[#2563EB]">&bull;</span>
          Location: {event.venue}
        </li>
      </ul>

      <div className="mt-5 rounded-lg bg-[#F8FAFC] p-4">
        <h3 className="text-sm font-semibold text-[#1E293B]">
          Event Schedule
        </h3>

        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="text-xs text-[#64748B]">Start Date & Time</p>
            <p className="mt-1 font-medium text-[#1E293B]">
              {formatDateTime(eventWithTimes.startDate)}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#64748B]">End Date & Time</p>
            <p className="mt-1 font-medium text-[#1E293B]">
              {formatDateTime(eventWithTimes.endDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#E2E8F0] pt-5">
        <div>
          <div className="text-xs text-[#64748B]">Capacity</div>
          <div className="text-sm font-semibold text-[#1E293B]">
            {event.capacityTotal.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#64748B]">Tickets from</div>
          <div className="text-sm font-semibold text-[#1E293B]">
            ₹0
          </div>
        </div>

        <div>
          <div className="text-xs text-[#64748B]">Category</div>
          <div className="text-sm font-semibold text-[#1E293B]">
            {event.category}
          </div>
        </div>
      </div>

      <h3 className="mt-5 text-sm font-semibold text-[#1E293B]">
        Venue
      </h3>

      <p className="mt-1 text-sm text-[#64748B]">
        {event.venue}
      </p>
    </div>
  );
}

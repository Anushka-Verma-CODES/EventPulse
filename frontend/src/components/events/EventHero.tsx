
import type { EventItem } from "../../types/event";

type EventHeroProps = {
  event: EventItem;
};

function formatDateTime(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date and time unavailable";
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

export default function EventHero({ event }: EventHeroProps) {
  // Use the actual backend dates when available.
  const eventWithTimes = event as EventItem & {
    startDate?: string;
    endDate?: string;
  };

  return (
    <div>
      <div
        className="h-56 rounded-2xl bg-[#EFF6FF] sm:h-72"
        aria-hidden="true"
      />

      <div className="mt-5">
        <h1 className="text-2xl font-bold text-[#1E293B] sm:text-3xl">
          {event.name}
        </h1>

        <div className="mt-1 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#64748B]">
            {event.category}
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-sm text-[#64748B]">
          <span>
            &#128197;{" "}
            {eventWithTimes.startDate
              ? `Starts: ${formatDateTime(eventWithTimes.startDate)}`
              : event.date}
          </span>

          {eventWithTimes.endDate && (
            <span>
              &#128336; Ends: {formatDateTime(eventWithTimes.endDate)}
            </span>
          )}

          <span>&#128205; {event.venue}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#475569]">
          {event.shortDescription}
        </p>
      </div>
    </div>
  );
}

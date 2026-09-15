import { mockEventDetail } from "../../lib/registrationMockData";

export default function EventHero() {
  const event = mockEventDetail;

  return (
    <div>
      <div className="h-56 rounded-2xl bg-[#EFF6FF] sm:h-72" aria-hidden="true" />

      <div className="mt-5">
        <h1 className="text-2xl font-bold text-[#1E293B] sm:text-3xl">{event.name}</h1>
        <div className="mt-1 flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#64748B]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#64748B]">
          <span>&#128197; {event.date}</span>
          <span>&#128337; {event.time}</span>
          <span>&#128205; {event.venue}</span>
        </div>
      </div>
    </div>
  );
}

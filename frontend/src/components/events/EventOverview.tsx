import { mockEventDetail, ticketCategories } from "../../lib/registrationMockData";

export default function EventOverview() {
  const event = mockEventDetail;
  const startingPrice = Math.min(...ticketCategories.map((c) => c.price));

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1E293B]">About the Event</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{event.description}</p>

      <h3 className="mt-5 text-sm font-semibold text-[#1E293B]">Event Highlights</h3>
      <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[#64748B]">
        {event.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-0.5 text-[#2563EB]">&bull;</span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#E2E8F0] pt-5">
        <div>
          <div className="text-xs text-[#64748B]">Capacity</div>
          <div className="text-sm font-semibold text-[#1E293B]">
            {event.capacity.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-[#64748B]">Tickets from</div>
          <div className="text-sm font-semibold text-[#1E293B]">&#8377;{startingPrice}</div>
        </div>
        <div>
          <div className="text-xs text-[#64748B]">Category</div>
          <div className="text-sm font-semibold text-[#1E293B]">{event.category}</div>
        </div>
      </div>

      <h3 className="mt-5 text-sm font-semibold text-[#1E293B]">Venue</h3>
      <p className="mt-1 text-sm text-[#64748B]">{event.venueAddress}</p>
    </div>
  );
}

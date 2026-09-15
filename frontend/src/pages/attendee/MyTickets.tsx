import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../features/events/api/eventsApi";

type TicketItem = {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  venue: string;
  gate: string;
  ticketNumber: string;
  section: string;
  status: string;
  imageUrl: string;
};

export default function MyTickets() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTickets() {
      const events = await getEvents();
      if (!isMounted) return;

      const registered = events.filter((event) => event.isRegistered);
      const mappedTickets = registered.map((event, index) => ({
        id: `${event.id}-ticket`,
        eventId: event.id,
        eventName: event.name,
        date: event.date,
        venue: event.venue,
        gate: event.gates[0]?.name ?? "Main Entry",
        ticketNumber: `EP-${String(index + 1).padStart(4, "0")}`,
        section: event.category,
        status: "Confirmed",
        imageUrl: event.imageUrl,
      }));

      setTickets(mappedTickets);
      setLoading(false);
    }

    loadTickets();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">My Tickets</h2>
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-8 text-sm text-[#64748B] shadow-sm">
          Loading your tickets...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">My Tickets</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Your registered event tickets and access details.
          </p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#E2E8F0] bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-[#64748B]">You haven&apos;t registered for any events yet.</p>
          <Link to="/events" className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline">
            Browse events →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/attendee/tickets/${ticket.id}`}
              className="group rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#93C5FD] hover:shadow-md"
            >
              <div className="mb-4 overflow-hidden rounded-lg bg-[#E2E8F0] aspect-[16/9]">
                <img
                  src={ticket.imageUrl}
                  alt={`${ticket.eventName} event`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
                  {ticket.section}
                </p>
                <span className="rounded-full bg-[#ECFDF5] px-2 py-1 text-[11px] font-medium text-[#166534]">
                  {ticket.status}
                </span>
              </div>

              <h3 className="mt-3 truncate text-base font-bold text-[#1E293B]">{ticket.eventName}</h3>
              <p className="mt-1 truncate text-sm text-[#64748B]">{ticket.date}</p>

              <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs">
                <span className="truncate text-[#64748B]">{ticket.venue}</span>
                <span className="ml-3 shrink-0 font-semibold text-[#2563EB] group-hover:underline">
                  View ticket
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

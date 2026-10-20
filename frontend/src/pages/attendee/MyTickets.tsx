
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyRegistrations } from "../../features/events/api/eventsApi";
import type { MyRegistration } from "../../features/events/api/eventsApi";

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
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTickets() {
      try {
        const registrations: MyRegistration[] = await getMyRegistrations();

        if (!isMounted) return;

        const mappedTickets = registrations.map((registration, index) => {
          const event = registration.event;

          return {
            id: registration.id,
            eventId: registration.eventId,
            eventName: event.title,
            date: new Date(event.startDate).toLocaleString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "Asia/Kolkata",
            }),
            venue: event.location,
            gate: "Main Entry",
            ticketNumber: `EP-${String(index + 1).padStart(4, "0")}`,
            section: event.category,
            status: "Registration Confirmed",
            imageUrl: event.bannerImage || "/event-hero.png",
          };
        });

        setTickets(mappedTickets);
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your registered events."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
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
          Loading your registrations...
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
            Your registered events and access details.
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-white p-6 text-sm text-red-600 shadow-sm"
        >
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#E2E8F0] bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-[#64748B]">
            You haven't registered for any events yet.
          </p>
          <Link
            to="/events"
            className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline"
          >
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
              <div className="mb-4 aspect-[16/9] overflow-hidden rounded-lg bg-[#E2E8F0]">
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

              <h3 className="mt-3 truncate text-base font-bold text-[#1E293B]">
                {ticket.eventName}
              </h3>

              <p className="mt-1 truncate text-sm text-[#64748B]">
                {ticket.date}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs">
                <span className="truncate text-[#64748B]">
                  {ticket.venue}
                </span>
                <span className="ml-3 shrink-0 font-semibold text-[#2563EB] group-hover:underline">
                  View details
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

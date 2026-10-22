
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyScannerEvents } from "../../features/events/api/eventsApi";
import type { EventItem } from "../../types/event";

export default function EventSelector() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const assignedEvents = await getMyScannerEvents();

        if (!cancelled) {
          const mappedEvents: EventItem[] = assignedEvents.map((event) => {
            const startDate = new Date(event.startDate);

            return {
              id: event.id,
              name: event.title,
              date: startDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              }),
              startDate: event.startDate,
              endDate: event.endDate,
              venue: event.location,
              category: event.category,
              shortDescription: event.description,
              fullDescription: event.description,
              capacityTotal: event.capacity,
              price: Number(event.price),
              capacityRegistered: 0,
              isRegistered: false,
              imageUrl: event.bannerImage || "/event-hero.png",
              gates: [],
            };
          });

          setEvents(mappedEvents);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your assigned events. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-[#1E293B]">
        EventPulse Scanner
      </h2>

      <p className="mt-1 text-sm text-[#64748B]">
        Scan attendee tickets quickly and securely.
      </p>

      <div className="mt-6 text-xs font-semibold tracking-wide text-[#94A3B8]">
        MY ASSIGNED EVENTS
      </div>

      {loading && (
        <p className="mt-4 text-sm text-[#64748B]">
          Loading your assigned events...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="font-medium text-[#1E293B]">
            No events assigned yet
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            Events will appear here when an organizer grants you scanner
            access.
          </p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/scanner/event/${event.id}`}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md active:translate-y-0"
            >
              <div className="text-lg font-semibold text-[#1E293B]">
                {event.name}
              </div>

              <div className="mt-1 text-sm text-[#64748B]">
                {event.date} &bull; {event.venue}
              </div>

              <span className="mt-3 inline-block rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white">
                Select Event
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

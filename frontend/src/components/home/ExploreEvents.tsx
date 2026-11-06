
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../features/events/api/eventsApi";
import type { EventItem } from "../../types/event";

export default function ExploreEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        const data = await getEvents();

        if (!isMounted) return;

        const upcomingEvents = data
          .filter(
            (event) =>
              new Date(event.startDate).getTime() >= Date.now()
          )
          .sort(
            (a, b) =>
              new Date(a.startDate).getTime() -
              new Date(b.startDate).getTime()
          );

        setEvents(upcomingEvents.slice(0, 3));
      } catch {
        if (isMounted) {
          setError("Unable to load events right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold tracking-[0.16em] text-[#2563EB]">
              DISCOVER SOMETHING NEW
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1E293B] sm:text-4xl">
              Find your next event.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#64748B]">
              From campus festivals to workshops and community gatherings,
              discover what's happening around you.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#DBEAFE] px-5 py-3 text-sm font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            Explore all events <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl bg-[#F1F5F9]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-sm text-[#B91C1C]">
            {error}
            <p className="mt-2 text-[#64748B]">
              You can still browse all events from the Explore Events page.
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-[#1E293B]">
              No upcoming events yet
            </h3>

            <p className="mt-2 text-sm text-[#64748B]">
              Check back soon for new events and activities.
            </p>

            <Link
              to="/events"
              className="mt-5 inline-flex rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              Browse events
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#BFDBFE] hover:shadow-xl hover:shadow-slate-200/60"
              >
                <div className="relative h-44 overflow-hidden bg-[#EFF6FF] sm:h-48">
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#1E293B]">
                    {event.category}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-medium text-white/80">
                      {event.date}
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-lg font-bold text-white">
                      {event.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[#64748B]">
                      {event.venue}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#1E293B]">
                      {event.price === 0
                        ? "Free entry"
                        : `₹${event.price}`}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-[#2563EB] transition group-hover:translate-x-1">
                    View event →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] px-6 py-5 sm:flex-row">
          <p className="text-sm text-[#64748B]">
            Have an event to organize? Bring it to EventPulse.
          </p>

          <Link
            to="/register"
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Get started →
          </Link>
        </div>
      </div>
    </section>
  );
}

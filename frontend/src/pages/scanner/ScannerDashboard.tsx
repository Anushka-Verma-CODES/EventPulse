
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyScannerEvents } from "../../features/events/api/eventsApi";

type AssignedEvent = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string;
};

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatEventTime(date: string) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export default function ScannerDashboard() {
  const [events, setEvents] = useState<AssignedEvent[]>([]);
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
          setEvents(assignedEvents);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your assigned events."
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

  const now = Date.now();
  const upcomingEvents = events.filter(
    (event) => new Date(event.startDate).getTime() >= now
  );
  const primaryEvent = upcomingEvents[0] ?? events[0];

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            Scanner workspace
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage assigned events and keep attendee check-ins moving
            smoothly.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
          <Link
            to="/scanner/events"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            View my events
          </Link>

          <Link
            to={primaryEvent ? `/scanner/event/${primaryEvent.id}` : "/scanner/events"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" />
            </svg>
            Start scanning
          </Link>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">
              Assigned events
            </p>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 9h18" />
              </svg>
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : events.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Events assigned to your account
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">
              Upcoming events
            </p>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
              </svg>
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {loading ? "—" : upcomingEvents.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Assigned events starting in the future
          </p>
        </div>

        <Link
          to="/scanner/history"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-6 sm:col-span-2 xl:col-span-1"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">
              Check-in activity
            </p>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5M12 7v5l3 2" />
              </svg>
            </span>
          </div>
          <p className="mt-4 text-lg font-bold text-slate-900">
            View scan history
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Review previous check-ins
          </p>
          <span className="mt-3 inline-flex text-sm font-semibold text-blue-600 group-hover:text-blue-800">
            Open history →
          </span>
        </Link>
      </section>

      {/* Main desktop content: events and sidebar */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Events */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Your assigned events
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Events authorized by your organizers.
              </p>
            </div>
            <Link
              to="/scanner/events"
              className="inline-flex items-center gap-1 self-start text-sm font-semibold text-blue-600 hover:text-blue-800 sm:self-center"
            >
              View all events →
            </Link>
          </div>

          {loading && (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-slate-100 p-5"
                >
                  <div className="h-4 w-3/5 rounded bg-slate-200" />
                  <div className="mt-4 h-3 w-4/5 rounded bg-slate-100" />
                  <div className="mt-3 h-3 w-2/5 rounded bg-slate-100" />
                  <div className="mt-6 h-10 rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <p className="font-semibold">Unable to load assigned events</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
              <h3 className="font-semibold text-slate-900">
                No events assigned yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                When an organizer grants you scanner access, your assigned
                events will appear here.
              </p>
              <Link
                to="/scanner/events"
                className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Open my events
              </Link>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {events.slice(0, 6).map((event) => {
                const isUpcoming =
                  new Date(event.startDate).getTime() >= now;

                return (
                  <article
                    key={event.id}
                    className="flex min-w-0 flex-col justify-between rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="break-words font-semibold leading-6 text-slate-900">
                          {event.title}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isUpcoming
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isUpcoming ? "Upcoming" : "Started"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-3 text-sm text-slate-600">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                          >
                            <rect x="3" y="4" width="18" height="17" rx="2" />
                            <path d="M16 2v4M8 2v4M3 9h18" />
                          </svg>
                          <span>
                            {formatEventDate(event.startDate)}
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {formatEventTime(event.startDate)}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-start gap-3 text-sm text-slate-600">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                          >
                            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                            <circle cx="12" cy="10" r="2.5" />
                          </svg>
                          <span className="break-words">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/scanner/event/${event.id}`}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                    >
                      Open scanning workspace →
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && !error && events.length > 6 && (
            <div className="mt-5 border-t border-slate-100 pt-4 text-center">
              <Link
                to="/scanner/events"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                View all {events.length} assigned events
              </Link>
            </div>
          )}
        </section>

        {/* Desktop sidebar, stacks below events on smaller screens */}
        <aside className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">Quick actions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Get to the tools you need.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                to={primaryEvent ? `/scanner/event/${primaryEvent.id}` : "/scanner/events"}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    Start scanning
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Open an assigned event
                  </span>
                </span>
                <span className="text-slate-400">→</span>
              </Link>

              <Link
                to="/scanner/events"
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M16 2v4M8 2v4M3 9h18" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    My events
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Browse assignments
                  </span>
                </span>
                <span className="text-slate-400">→</span>
              </Link>

              <Link
                to="/scanner/history"
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5M12 7v5l3 2" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    Scan history
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Review check-in records
                  </span>
                </span>
                <span className="text-slate-400">→</span>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M12 3 4 6v5c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h2 className="mt-4 font-bold text-slate-900">
              Secure check-in
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Scan tickets for events assigned to you. Access is restricted
              by your organizer's event-specific authorization.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

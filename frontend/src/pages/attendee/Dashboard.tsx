
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Ticket } from "lucide-react";
import { mockAttendee } from "../../lib/mockUser";
import DashboardBackdrop from "../../components/ui/DashboardBackdrop";
import { getMyRegistrations } from "../../features/events/api/eventsApi";
import type { MyRegistration } from "../../features/events/api/eventsApi";

export default function Dashboard() {
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyRegistrations()
      .then((result) => {
        setRegistrations(result);
        setError("");
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your registered events."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const upcomingRegistrations = registrations.filter(
    (registration) =>
      new Date(registration.event.startDate).getTime() >= Date.now() &&
      registration.event.status === "published"
  );

  const stats = [
    { label: "Upcoming Events", value: upcomingRegistrations.length },
    { label: "Active Tickets", value: upcomingRegistrations.length },
    {
      label: "Events Attended",
      value: registrations.filter(
        (registration) =>
          new Date(registration.event.endDate).getTime() < Date.now()
      ).length,
    },
    { label: "Pending Actions", value: 0 },
  ];

  return (
    <div className="relative isolate -m-6 min-h-[calc(100vh-3rem)] overflow-hidden p-6 sm:-m-8 sm:p-8">
      <DashboardBackdrop />

      <div className="relative z-10">
        <section className="overflow-hidden rounded-2xl border border-[#BFDBFE] bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                Your event hub
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#1E293B] sm:text-3xl">
                Welcome back, {mockAttendee.name.split(" ")[0]}!
              </h2>

              <p className="mt-2 max-w-xl text-sm text-[#64748B]">
                Discover events, manage your tickets and stay updated.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                <CalendarDays className="h-4 w-4" />
                Browse events
              </Link>

              <Link
                to="/attendee/tickets"
                className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#93C5FD] hover:bg-[#EFF6FF]"
              >
                <Ticket className="h-4 w-4" />
                My tickets
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
            >
              <div className="text-2xl font-semibold text-[#1E293B]">
                {loading ? "—" : stat.value}
              </div>
              <div className="mt-1 text-xs text-[#64748B]">{stat.label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1E293B]">
                Upcoming Events
              </h3>
              <Link
                to="/events"
                className="text-xs font-medium text-[#2563EB] hover:underline"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <p className="py-2.5 text-sm text-[#64748B]">
                Loading your events...
              </p>
            ) : error ? (
              <p className="py-2.5 text-sm text-[#64748B]">
                Your events could not be loaded.
              </p>
            ) : upcomingRegistrations.length === 0 ? (
              <p className="py-2.5 text-sm text-[#64748B]">
                You haven't registered for any upcoming events yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[#E2E8F0]">
                {upcomingRegistrations.map((registration) => (
                  <li key={registration.id} className="py-2.5">
                    <Link
                      to={`/events/${registration.eventId}`}
                      className="text-sm font-medium text-[#1E293B] hover:text-[#2563EB]"
                    >
                      {registration.event.title}
                    </Link>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {new Date(
                        registration.event.startDate
                      ).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      })}
                      {" · "}
                      {registration.event.location}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1E293B]">
                My Upcoming Tickets
              </h3>
              <Link
                to="/attendee/tickets"
                className="text-xs font-medium text-[#2563EB] hover:underline"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <p className="py-2.5 text-sm text-[#64748B]">
                Loading your tickets...
              </p>
            ) : error ? (
              <p className="py-2.5 text-sm text-[#64748B]">
                Your tickets could not be loaded.
              </p>
            ) : upcomingRegistrations.length === 0 ? (
              <p className="py-2.5 text-sm text-[#64748B]">
                No upcoming tickets yet. Browse events to get started.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[#E2E8F0]">
                {upcomingRegistrations.map((registration) => (
                  <li key={registration.id} className="py-2.5">
                    <Link
                      to="/attendee/tickets"
                      className="text-sm font-medium text-[#1E293B] hover:text-[#2563EB]"
                    >
                      {registration.event.title}
                    </Link>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {registration.event.location}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

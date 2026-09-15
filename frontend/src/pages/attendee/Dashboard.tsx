import { Link } from "react-router-dom";
import { CalendarDays, Ticket } from "lucide-react";
import { mockAttendee } from "../../lib/mockUser";
import DashboardBackdrop from "../../components/ui/DashboardBackdrop";

const stats = [
  { label: "Upcoming Events", value: 3 },
  { label: "Active Tickets", value: 4 },
  { label: "Events Attended", value: 8 },
  { label: "Pending Actions", value: 1 },
];

const upcomingEvents = ["Tech Fest 2026", "Developer Workshop", "Cultural Evening"];
const upcomingTickets = ["Tech Fest 2026", "Developer Workshop", "Cultural Evening"];

export default function Dashboard() {
  return (
    <div className="relative isolate -m-6 min-h-[calc(100vh-3rem)] overflow-hidden p-6 sm:-m-8 sm:p-8">
      <DashboardBackdrop />
      <div className="relative z-10">
      <section className="overflow-hidden rounded-2xl border border-[#BFDBFE] bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">Your event hub</p>
            <h2 className="mt-2 text-2xl font-bold text-[#1E293B] sm:text-3xl">
              Welcome back, {mockAttendee.name.split(" ")[0]}!
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#64748B]">
              Discover events, manage your tickets and stay updated.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/events" className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]">
              <CalendarDays className="h-4 w-4" /> Browse events
            </Link>
            <Link to="/attendee/tickets" className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#93C5FD] hover:bg-[#EFF6FF]">
              <Ticket className="h-4 w-4" /> My tickets
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
            <div className="text-2xl font-semibold text-[#1E293B]">{stat.value}</div>
            <div className="mt-1 text-xs text-[#64748B]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1E293B]">Upcoming Events</h3>
            <Link to="/events" className="text-xs font-medium text-[#2563EB] hover:underline">
              View all
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-[#E2E8F0]">
            {upcomingEvents.map((event) => (
              <li key={event} className="py-2.5 text-sm text-[#1E293B]">
                {event}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1E293B]">My Upcoming Tickets</h3>
            <Link
              to="/attendee/tickets"
              className="text-xs font-medium text-[#2563EB] hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-[#E2E8F0]">
            {upcomingTickets.map((ticket) => (
              <li key={ticket} className="py-2.5 text-sm text-[#1E293B]">
                {ticket}
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}

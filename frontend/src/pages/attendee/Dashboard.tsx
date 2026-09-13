import { Link } from "react-router-dom";
import { mockAttendee } from "../../lib/mockUser";

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
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">
        Welcome back, {mockAttendee.name.split(" ")[0]}!
      </h2>
      <p className="mt-1 text-sm text-[#64748B]">
        Discover events, manage your tickets and stay updated.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            <div className="text-2xl font-semibold text-[#1E293B]">{stat.value}</div>
            <div className="mt-1 text-xs text-[#64748B]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
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

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
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
  );
}

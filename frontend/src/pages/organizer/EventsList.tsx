import { useState } from "react";
import { Link } from "react-router-dom";
import { organizerEvents } from "../../lib/organizerMockData";
import StatusBadge from "../../components/organizer/StatusBadge";

const filters = ["All", "Upcoming", "Ongoing", "Completed", "Draft"];

export default function EventsList() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? organizerEvents
      : organizerEvents.filter((e) => e.status === activeFilter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">My Events</h2>
          <p className="mt-1 text-sm text-[#64748B]">Manage your upcoming and past events.</p>
        </div>
        <Link
          to="/organizer/events/create"
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          + Create Event
        </Link>
      </div>

      <div className="mt-5 flex gap-2 border-b border-[#E2E8F0]">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Venue</th>
              <th className="px-4 py-3 font-medium">Registrations</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filtered.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3 font-medium text-[#1E293B]">{event.name}</td>
                <td className="px-4 py-3 text-[#64748B]">{event.date}</td>
                <td className="px-4 py-3 text-[#64748B]">{event.venue}</td>
                <td className="px-4 py-3 text-[#64748B]">
                  {event.registered.toLocaleString()} / {event.capacity.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={event.status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/organizer/events/${event.id}`}
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

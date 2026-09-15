import { Link } from "react-router-dom";
import StatCard from "../../components/organizer/StatCard";
import {
  mockOrganizer,
  quickStats,
  organizerEvents,
  weeklyAttendance,
  recentActivity,
} from "../../lib/organizerMockData";
import DashboardBackdrop from "../../components/ui/DashboardBackdrop";

export default function OrganizerDashboard() {
  const upcoming = organizerEvents.filter((e) => e.status === "Upcoming");
  const maxAttendance = Math.max(...weeklyAttendance.map((d) => d.value));

  return (
    <div className="relative isolate -m-6 min-h-[calc(100vh-3rem)] overflow-hidden p-6 sm:-m-8 sm:p-8">
      <DashboardBackdrop />
      <div className="relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Good morning, {mockOrganizer.name.split(" ")[0]}
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Here&apos;s what&apos;s happening with your events.
          </p>
        </div>
        <Link
          to="/organizer/events/create"
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          + Create Event
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1E293B]">Upcoming Events</h3>
            <Link to="/organizer/events" className="text-xs font-medium text-[#2563EB] hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-[#E2E8F0]">
            {upcoming.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-[#1E293B]">{event.name}</div>
                  <div className="text-xs text-[#64748B]">
                    {event.date} &bull; {event.venue}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {event.registered.toLocaleString()} registered
                  </div>
                </div>
                <Link
                  to={`/organizer/events/${event.id}`}
                  className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
                >
                  Manage Event
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
          <h3 className="mb-4 text-sm font-semibold text-[#1E293B]">Attendance Overview</h3>
          <div className="flex h-40 items-end gap-4">
            {weeklyAttendance.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[#2563EB]"
                  style={{ height: `${(day.value / maxAttendance) * 100}%` }}
                />
                <span className="text-xs text-[#64748B]">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">Recent Activity</h3>
        <ul className="flex flex-col divide-y divide-[#E2E8F0]">
          {recentActivity.map((item, i) => (
            <li key={i} className="flex items-start gap-2 py-2.5 text-sm">
              <span className="mt-0.5 text-[#16A34A]">&#10003;</span>
              <span>
                <span className="text-[#1E293B]">{item.text}</span>
                <span className="ml-1 text-[#64748B]">&middot; {item.context}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}

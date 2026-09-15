import { Link } from "react-router-dom";
import StatCard from "../../components/volunteer/StatCard";
import StatusBadge from "../../components/volunteer/StatusBadge";
import { mockVolunteer, volunteerStats, nextShift, myEvents, recentActivity } from "../../lib/volunteerMockData";
import DashboardBackdrop from "../../components/ui/DashboardBackdrop";

export default function VolunteerDashboard() {
  return (
    <div className="relative isolate -m-6 min-h-[calc(100vh-3rem)] overflow-hidden p-6 sm:-m-8 sm:p-8">
      <DashboardBackdrop />
      <div className="relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Welcome back, {mockVolunteer.name.split(" ")[0]}!
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Here&apos;s what&apos;s happening with your volunteer activities.
          </p>
        </div>
        <Link
          to="/volunteer/opportunities"
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          Browse Opportunities
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {volunteerStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1E293B]">Upcoming Shift</h3>
          <StatusBadge status={nextShift.status} />
        </div>
        <div className="text-base font-medium text-[#1E293B]">{nextShift.event}</div>
        <div className="mt-1 text-sm text-[#64748B]">
          {nextShift.role} &bull; {nextShift.location}
        </div>
        <div className="mt-1 text-sm text-[#64748B]">
          {nextShift.date} &bull; {nextShift.time}
        </div>
        <Link
          to="/volunteer/shifts"
          className="mt-3 inline-block rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          View Shift
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
          <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">My Events</h3>
          <div className="flex flex-col divide-y divide-[#E2E8F0]">
            {myEvents.map((event) => (
              <div key={event.event} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1E293B]">{event.event}</span>
                  <StatusBadge status={event.status} />
                </div>
                <div className="mt-1 text-xs text-[#64748B]">{event.role}</div>
                <div className="text-xs text-[#64748B]">{event.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
          <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">Recent Activity</h3>
          <ul className="flex flex-col divide-y divide-[#E2E8F0]">
            {recentActivity.map((item, i) => (
              <li key={i} className="py-2.5">
                <div className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-[#16A34A]">&#10003;</span>
                  <span className="text-[#1E293B]">{item.text}</span>
                </div>
                <div className="pl-5 text-xs text-[#64748B]">
                  {item.context} &middot; {item.time}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </div>
  );
}

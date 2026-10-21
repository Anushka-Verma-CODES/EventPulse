
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/organizer/StatCard";
import DashboardBackdrop from "../../components/ui/DashboardBackdrop";
import {
  getOrganizerDashboardStats,
  type OrganizerDashboardStats,
} from "../../features/dashboard/api/dashboardApi";
import { getMyProfile } from "../../lib/authApi";

export default function OrganizerDashboard() {
  const [stats, setStats] = useState<OrganizerDashboardStats | null>(null);
  const [organizerName, setOrganizerName] = useState("Organizer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [dashboardData, profile] = await Promise.all([
          getOrganizerDashboardStats(),
          getMyProfile(),
        ]);

        if (!active) return;

        setStats(dashboardData);
        setOrganizerName(profile.fullName.split(" ")[0]);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const statCards = stats
    ? [
        { label: "Total Events", value: stats.totalEvents },
        { label: "Upcoming Events", value: stats.upcomingEvents },
        { label: "Total Registrations", value: stats.totalRegistrations },
        { label: "Total Check-ins", value: stats.totalCheckIns },
      ]
    : [];

  const maxAttendance = Math.max(
    1,
    ...(stats?.weeklyAttendance.map((day) => day.value) ?? []),
  );

  return (
    <div className="relative isolate -m-6 min-h-[calc(100vh-3rem)] overflow-hidden p-6 sm:-m-8 sm:p-8">
      <DashboardBackdrop />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">
              Good morning, {organizerName}
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

        {loading && (
          <p className="mt-6 text-sm text-[#64748B]">
            Loading dashboard data...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={String(stat.value)}
                />
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1E293B]">
                    Upcoming Events
                  </h3>
                  <Link
                    to="/organizer/events"
                    className="text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="flex flex-col divide-y divide-[#E2E8F0]">
                  {stats.upcomingEventsList.length > 0 ? (
                    stats.upcomingEventsList.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#1E293B]">
                            {event.name}
                          </div>
                          <div className="text-xs text-[#64748B]">
                            {new Date(event.date).toLocaleDateString()}{" "}
                            &bull; {event.venue}
                          </div>
                          <div className="text-xs text-[#64748B]">
                            {event.registered.toLocaleString()} registered
                          </div>
                        </div>

                        <Link
                          to={`/organizer/events/${event.id}`}
                          className="shrink-0 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
                        >
                          Manage Event
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-[#64748B]">
                      No upcoming published events.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
                <h3 className="mb-4 text-sm font-semibold text-[#1E293B]">
                  Attendance Overview
                </h3>

                <div className="flex h-40 items-end gap-4">
                  {stats.weeklyAttendance.map((day) => (
                    <div
                      key={day.day}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t-md bg-[#2563EB]"
                        style={{
                          height: `${(day.value / maxAttendance) * 100}%`,
                          minHeight: day.value > 0 ? "4px" : "0",
                        }}
                        title={`${day.value} check-ins`}
                      />
                      <span className="text-xs text-[#64748B]">
                        {day.day}
                      </span>
                    </div>
                  ))}
                </div>

                {stats.totalCheckIns === 0 && (
                  <p className="mt-3 text-xs text-[#64748B]">
                    No check-ins recorded yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
              <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">
                Recent Activity
              </h3>

              <ul className="flex flex-col divide-y divide-[#E2E8F0]">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-2 py-2.5 text-sm"
                    >
                      <span className="mt-0.5 text-[#16A34A]">
                        &#10003;
                      </span>
                      <span>
                        <span className="text-[#1E293B]">
                          {item.text}
                        </span>
                        <span className="ml-1 text-[#64748B]">
                          &middot; {item.context}
                        </span>
                        {item.date && (
                          <span className="ml-2 text-xs text-[#94A3B8]">
                            {new Date(item.date).toLocaleString()}
                          </span>
                        )}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-sm text-[#64748B]">
                    No recent registration activity yet.
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

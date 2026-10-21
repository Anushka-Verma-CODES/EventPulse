
import { useCallback, useEffect, useState } from "react";
import { getAuthHeaders } from "../../lib/authApi";

const API_BASE_URL = "http://localhost:3000";

type DashboardStats = {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalCheckIns: number;
};

type BackendAttendee = {
  id: string;
  name: string;
  email: string;
  eventName: string;
  registeredOn: string;
  status: string;
  checkedInAt: string | null;
  gate: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function isCheckedIn(attendee: BackendAttendee) {
  return (
    attendee.status.toLowerCase() === "checked in" ||
    Boolean(attendee.checkedInAt)
  );
}

export default function LiveMonitoring() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendees, setAttendees] = useState<BackendAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMonitoringData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const headers = {
        ...getAuthHeaders(),
        "Cache-Control": "no-cache",
      };

      const [statsResponse, attendeesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/registrations/organizer/dashboard-stats`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_BASE_URL}/registrations/organizer/attendees`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (!statsResponse.ok || !attendeesResponse.ok) {
        if (
          statsResponse.status === 401 ||
          statsResponse.status === 403 ||
          attendeesResponse.status === 401 ||
          attendeesResponse.status === 403
        ) {
          throw new Error(
            "You are not authorized to view monitoring data. Please log in with your organizer account."
          );
        }

        throw new Error(
          "Unable to load monitoring data. Check that the backend is running and try again."
        );
      }

      const statsData: DashboardStats = await statsResponse.json();
      const attendeeData: BackendAttendee[] =
        await attendeesResponse.json();

      setStats(statsData);
      setAttendees(Array.isArray(attendeeData) ? attendeeData : []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading monitoring data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMonitoringData();

    const intervalId = window.setInterval(() => {
      void loadMonitoringData(true);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [loadMonitoringData]);

  const checkedInAttendees = attendees.filter(isCheckedIn);

  const recentScans = checkedInAttendees
    .filter((attendee) => attendee.checkedInAt)
    .sort(
      (first, second) =>
        new Date(second.checkedInAt!).getTime() -
        new Date(first.checkedInAt!).getTime()
    )
    .slice(0, 10);

  const remainingRegistrations = Math.max(
    0,
    (stats?.totalRegistrations ?? 0) - (stats?.totalCheckIns ?? 0)
  );

  const statCards = [
    {
      label: "Total Registrations",
      value: stats?.totalRegistrations ?? 0,
    },
    {
      label: "Checked In",
      value: stats?.totalCheckIns ?? 0,
    },
    {
      label: "Not Checked In",
      value: remainingRegistrations,
    },
    {
      label: "Total Events",
      value: stats?.totalEvents ?? 0,
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#1E293B]">
          Live Event Monitoring
        </h2>
        <p className="mt-4 text-sm text-[#64748B]">
          Loading attendance data...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Live Event Monitoring
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Attendance and ticket check-in overview for your events
          </p>
          {lastUpdated && (
            <p className="mt-1 text-xs text-[#64748B]">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void loadMonitoringData(true)}
          disabled={refreshing}
          className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadMonitoringData()}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {stats && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
              >
                <div className="text-2xl font-semibold text-[#1E293B]">
                  {stat.value.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-[#64748B]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1E293B]">
              Attendance overview
            </h3>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span className="text-[#64748B]">Registration check-in rate</span>
              <span className="font-semibold text-[#1E293B]">
                {stats.totalRegistrations > 0
                  ? `${Math.round(
                      (stats.totalCheckIns / stats.totalRegistrations) * 100
                    )}%`
                  : "0%"}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all"
                style={{
                  width: `${
                    stats.totalRegistrations > 0
                      ? Math.min(
                          100,
                          (stats.totalCheckIns / stats.totalRegistrations) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-[#64748B]">
              This percentage is based on registrations, not venue capacity.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#1E293B]">
                Recent Check-ins
              </h3>
              <span className="text-xs text-[#64748B]">
                Latest 10 recorded check-ins
              </span>
            </div>

            {recentScans.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
                      <th className="py-3 pr-4 font-medium">Attendee</th>
                      <th className="py-3 pr-4 font-medium">Event</th>
                      <th className="py-3 pr-4 font-medium">Check-in time</th>
                      <th className="py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {recentScans.map((attendee) => (
                      <tr key={attendee.id}>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-[#1E293B]">
                            {attendee.name}
                          </div>
                          <div className="text-xs text-[#64748B]">
                            {attendee.email}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-[#64748B]">
                          {attendee.eventName}
                        </td>
                        <td className="py-3 pr-4 text-[#64748B]">
                          {formatDate(attendee.checkedInAt)}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            Checked In
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-6 text-sm text-[#64748B]">
                No check-ins have been recorded for your events yet.
              </p>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <h3 className="text-sm font-semibold text-[#1E293B]">
              Gate monitoring
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Gate-wise entries and scans per minute are not available from the
              current backend APIs. This section will require gate identifiers
              and scan-history data before it can display reliable figures.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

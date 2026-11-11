
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyEvents } from "../../features/events/api/eventsApi";
import { API_BASE_URL } from "../../lib/apiConfig";
import { getAuthHeaders } from "../../lib/authApi";
import ScannerAssignmentsPanel from "../../components/organizer/ScannerAssignmentsPanel";

type OrganizerEvent = {
  id: string;
  title: string;
  status: "draft" | "published" | "cancelled";
};

type DashboardStats = {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalCheckIns: number;
};

type BackendAttendee = {
  id: string;
  attendeeId: string;
  eventId: string;
  name: string;
  email: string;
  eventName: string;
  registeredOn: string;
  status: string;
  checkedInAt: string | null;
  gate: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isCheckedIn(attendee: BackendAttendee) {
  return (
    attendee.status?.toLowerCase() === "checked in" ||
    Boolean(attendee.checkedInAt)
  );
}

function isValidGate(gate: string | null) {
  return Boolean(
    gate &&
      gate.trim() &&
      gate.trim() !== "—" &&
      gate.trim().toLowerCase() !== "unknown"
  );
}

export default function LiveMonitoring() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
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

      const [statsResponse, attendeesResponse, eventData] =
        await Promise.all([
          fetch(`${API_BASE_URL}/registrations/organizer/dashboard-stats`, {
            headers,
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/registrations/organizer/attendees`, {
            headers,
            cache: "no-store",
          }),
          getMyEvents(),
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

      const availableEvents = eventData.filter(
        (event) => event.status !== "cancelled"
      );

      setStats(statsData);
      setAttendees(Array.isArray(attendeeData) ? attendeeData : []);
      setEvents(availableEvents);

      setSelectedEventId((currentId) => {
        if (
          currentId &&
          availableEvents.some((event) => event.id === currentId)
        ) {
          return currentId;
        }

        return availableEvents[0]?.id ?? "";
      });

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

  const selectedEvent = events.find(
    (event) => event.id === selectedEventId
  );

  const eventAttendees = useMemo(
    () => attendees.filter(
      (attendee) => attendee.eventId === selectedEventId
    ),
    [attendees, selectedEventId]
  );

  const checkedInAttendees = useMemo(
    () => eventAttendees.filter(isCheckedIn),
    [eventAttendees]
  );

  const recentScans = useMemo(
    () =>
      checkedInAttendees
        .filter((attendee) => attendee.checkedInAt)
        .sort(
          (first, second) =>
            new Date(second.checkedInAt!).getTime() -
            new Date(first.checkedInAt!).getTime()
        )
        .slice(0, 10),
    [checkedInAttendees]
  );

  const entriesInLastFiveMinutes = checkedInAttendees.filter(
    (attendee) => {
      if (!attendee.checkedInAt) return false;

      const checkedInTime = new Date(attendee.checkedInAt).getTime();
      const difference = Date.now() - checkedInTime;

      return difference >= 0 && difference <= 5 * 60 * 1000;
    }
  ).length;

  const gateActivity = useMemo(() => {
    const gateCounts = new Map<string, number>();

    checkedInAttendees.forEach((attendee) => {
      if (!isValidGate(attendee.gate)) return;

      const gateName = attendee.gate!.trim();

      gateCounts.set(
        gateName,
        (gateCounts.get(gateName) ?? 0) + 1
      );
    });

    return Array.from(gateCounts.entries())
      .map(([gateName, entries]) => ({ gateName, entries }))
      .sort((first, second) => second.entries - first.entries);
  }, [checkedInAttendees]);

  const totalRegistrations = eventAttendees.length;
  const totalCheckIns = checkedInAttendees.length;
  const remainingRegistrations = Math.max(
    0,
    totalRegistrations - totalCheckIns
  );

  const checkInRate =
    totalRegistrations > 0
      ? Math.round((totalCheckIns / totalRegistrations) * 100)
      : 0;

  const statCards = [
    {
      label: "Total Registrations",
      value: totalRegistrations,
    },
    {
      label: "Checked In",
      value: totalCheckIns,
    },
    {
      label: "Not Checked In",
      value: remainingRegistrations,
    },
    {
      label: "Entries · Last 5 Minutes",
      value: entriesInLastFiveMinutes,
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
            Monitor attendance and gate activity for your events.
          </p>
          {lastUpdated && (
            <p className="mt-1 text-xs text-[#64748B]">
              Last updated: {lastUpdated.toLocaleTimeString("en-IN")}
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

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <label
          htmlFor="monitoring-event"
          className="mb-2 block text-sm font-semibold text-[#1E293B]"
        >
          Select event
        </label>

        {events.length > 0 ? (
          <select
            id="monitoring-event"
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="w-full max-w-lg rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} ({event.status})
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-[#64748B]">
            You have no events available for monitoring yet.
          </p>
        )}

        {selectedEvent && (
          <p className="mt-2 text-xs text-[#64748B]">
            Monitoring data for {selectedEvent.title}
          </p>
        )}
      </div>

      {events.length > 0 && selectedEventId && (
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
              <span className="text-[#64748B]">
                Registration check-in rate
              </span>
              <span className="font-semibold text-[#1E293B]">
                {checkInRate}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all"
                style={{ width: `${checkInRate}%` }}
              />
            </div>

            <p className="mt-3 text-xs text-[#64748B]">
              This percentage is based on registrations for the selected
              event, not venue capacity.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#1E293B]">
                  Gate Activity
                </h3>
                <p className="mt-1 text-xs text-[#64748B]">
                  Successful check-ins grouped by recorded gate.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {gateActivity.length} active gate records
              </span>
            </div>

            {gateActivity.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gateActivity.map((gate) => (
                  <div
                    key={gate.gateName}
                    className="rounded-lg border border-[#E2E8F0] p-4"
                  >
                    <div className="text-sm font-semibold text-[#1E293B]">
                      {gate.gateName}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-[#2563EB]">
                      {gate.entries}
                    </div>
                    <div className="text-xs text-[#64748B]">
                      Successful entries
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
                No gate-wise check-in records are available for this event
                yet.
              </p>
            )}
          </div>

          {selectedEventId && (
  <ScannerAssignmentsPanel eventId={selectedEventId} />
)}

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
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
                      <th className="py-3 pr-4 font-medium">Attendee</th>
                      <th className="py-3 pr-4 font-medium">Gate</th>
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
                          {isValidGate(attendee.gate)
                            ? attendee.gate
                            : "Not recorded"}
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
                No check-ins have been recorded for this event yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

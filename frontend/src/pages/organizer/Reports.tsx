
import { useEffect, useMemo, useState } from "react";
import { getAuthHeaders } from "../../lib/authApi";
import { getMyEvents } from "../../features/events/api/eventsApi";

const API_BASE_URL = "http://localhost:3000";

type OrganizerEvent = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
};

type OrganizerAttendee = {
  id: string;
  attendeeId: string;
  name: string;
  email: string;
  eventName: string;
  registeredOn: string;
  status: string;
  checkedInAt: string | null;
  gate: string;
};

type Resource = {
  id: string;
  eventId: string;
  name: string;
  totalQuantity: number;
  usedQuantity: number;
  availableQuantity: number;
  unit: string;
  status: string;
};

type ReportSection =
  | "Attendance"
  | "Gate Performance"
  | "Volunteer Performance"
  | "Incidents"
  | "Resources";

const reportSections: ReportSection[] = [
  "Attendance",
  "Gate Performance",
  "Volunteer Performance",
  "Incidents",
  "Resources",
];

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function formatDate(value: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="text-2xl font-semibold text-[#1E293B]">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-[#334155]">
        {label}
      </div>
      <p className="mt-1 text-xs text-[#64748B]">{description}</p>
    </div>
  );
}

export default function Reports() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [attendees, setAttendees] = useState<OrganizerAttendee[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [activeSection, setActiveSection] =
    useState<ReportSection>("Attendance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resourceError, setResourceError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const [eventData, attendeeData] = await Promise.all([
          getMyEvents(),
          fetchApi<OrganizerAttendee[]>(
            "/registrations/organizer/attendees",
          ),
        ]);

        if (!isActive) return;

        setEvents(eventData);
        setAttendees(attendeeData);

        const resourceData = await fetchApi<Resource[]>("/resources");

        if (isActive) {
          setResources(resourceData);
          setResourceError("");
        }
      } catch (requestError) {
        if (!isActive) return;

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load report data.";

        // Attendance data and event data are essential.
        // Resource data is optional for the attendance report.
        if (message.includes("/resources")) {
          setResourceError(message);
        } else {
          setError(message);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadReports();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedEvent = events.find(
    (event) => event.id === selectedEventId,
  );

  const filteredAttendees = useMemo(() => {
    if (selectedEventId === "all") return attendees;

    if (!selectedEvent) return [];

    return attendees.filter(
      (attendee) => attendee.eventName === selectedEvent.title,
    );
  }, [attendees, selectedEventId, selectedEvent]);

  const checkedInCount = filteredAttendees.filter(
    (attendee) => attendee.status === "Checked In",
  ).length;

  const registrationCount = filteredAttendees.length;
  const noShowCount = registrationCount - checkedInCount;

  const attendanceRate =
    registrationCount > 0
      ? Math.round((checkedInCount / registrationCount) * 100)
      : 0;

  const filteredResources =
    selectedEventId === "all"
      ? resources
      : resources.filter(
          (resource) => resource.eventId === selectedEventId,
        );

  const reportTitle = selectedEvent
    ? selectedEvent.title
    : "All Events";

  const reportDate = selectedEvent
    ? formatDate(selectedEvent.startDate)
    : `${events.length} event${events.length === 1 ? "" : "s"}`;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Event Reports
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Review registrations, attendance, and available event resources.
          </p>
        </div>

        <label className="text-sm font-medium text-[#334155]">
          Select event
          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="mt-1.5 block w-full min-w-52 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 sm:w-auto"
          >
            <option value="all">All events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h3 className="text-lg font-semibold text-[#1E293B]">
          {reportTitle}
        </h3>
        <p className="mt-1 text-sm text-[#64748B]">{reportDate}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
          Loading report data...
        </div>
      ) : !error ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Registrations"
              value={registrationCount.toLocaleString()}
              description="Registered attendees"
            />
            <SummaryCard
              label="Checked In"
              value={checkedInCount.toLocaleString()}
              description="Successful check-ins"
            />
            <SummaryCard
              label="No Shows"
              value={noShowCount.toLocaleString()}
              description="Not checked in yet"
            />
            <SummaryCard
              label="Attendance Rate"
              value={`${attendanceRate}%`}
              description="Check-ins divided by registrations"
            />
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1E293B]">
              Report Sections
            </h3>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {reportSections.map((section) => {
                const isAvailable =
                  section === "Attendance" || section === "Resources";

                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setActiveSection(section)}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                      activeSection === section
                        ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                        : "border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <span className="font-medium">{section}</span>
                    <span
                      className={`text-xs ${
                        isAvailable
                          ? "text-[#15803D]"
                          : "text-[#64748B]"
                      }`}
                    >
                      {isAvailable ? "Available" : "Not connected"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-[#E2E8F0] pt-5">
              {activeSection === "Attendance" && (
                <div>
                  <h4 className="text-base font-semibold text-[#1E293B]">
                    Attendance Details
                  </h4>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Registration and check-in records from the backend.
                  </p>

                  {filteredAttendees.length === 0 ? (
                    <p className="mt-5 rounded-lg bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
                      No registrations found for this selection.
                    </p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-650px text-left text-sm">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] text-xs uppercase text-[#64748B]">
                            <th className="px-3 py-3 font-medium">
                              Attendee
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Event
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Registered
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Status
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Check-in time
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAttendees.map((attendee) => (
                            <tr
                              key={attendee.id}
                              className="border-b border-[#F1F5F9] last:border-0"
                            >
                              <td className="px-3 py-3">
                                <div className="font-medium text-[#1E293B]">
                                  {attendee.name}
                                </div>
                                <div className="mt-0.5 text-xs text-[#64748B]">
                                  {attendee.email}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {attendee.eventName}
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {formatDateTime(attendee.registeredOn)}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    attendee.status === "Checked In"
                                      ? "bg-[#DCFCE7] text-[#166534]"
                                      : "bg-[#F1F5F9] text-[#475569]"
                                  }`}
                                >
                                  {attendee.status}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {formatDateTime(attendee.checkedInAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "Resources" && (
                <div>
                  <h4 className="text-base font-semibold text-[#1E293B]">
                    Resource Summary
                  </h4>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Inventory quantities and stock status for the selected
                    event.
                  </p>

                  {resourceError ? (
                    <p className="mt-4 text-sm text-[#B91C1C]">
                      {resourceError}
                    </p>
                  ) : filteredResources.length === 0 ? (
                    <p className="mt-4 rounded-lg bg-[#F8FAFC] p-5 text-center text-sm text-[#64748B]">
                      No resources found for this selection.
                    </p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-500px text-left text-sm">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] text-xs uppercase text-[#64748B]">
                            <th className="px-3 py-3 font-medium">
                              Resource
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Total
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Used
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Available
                            </th>
                            <th className="px-3 py-3 font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredResources.map((resource) => (
                            <tr
                              key={resource.id}
                              className="border-b border-[#F1F5F9] last:border-0"
                            >
                              <td className="px-3 py-3 font-medium text-[#1E293B]">
                                {resource.name}
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {resource.totalQuantity} {resource.unit}
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {resource.usedQuantity}
                              </td>
                              <td className="px-3 py-3 text-[#475569]">
                                {resource.availableQuantity}
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    resource.status === "Available"
                                      ? "bg-[#DCFCE7] text-[#166534]"
                                      : resource.status === "Low"
                                        ? "bg-[#FEF3C7] text-[#92400E]"
                                        : "bg-[#FEE2E2] text-[#991B1B]"
                                  }`}
                                >
                                  {resource.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeSection !== "Attendance" &&
                activeSection !== "Resources" && (
                  <div className="rounded-lg bg-[#F8FAFC] p-5">
                    <h4 className="font-semibold text-[#1E293B]">
                      {activeSection}
                    </h4>
                    <p className="mt-2 text-sm text-[#64748B]">
                      This report is not connected to a dedicated backend
                      data source yet. No mock figures are shown here.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

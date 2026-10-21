
import { useCallback, useEffect, useMemo, useState } from "react";
import StatCard from "../../components/organizer/StatCard";
import StatusBadge from "../../components/organizer/StatusBadge";
import { volunteerShifts } from "../../lib/organizerMockData";
import { getMyEvents } from "../../features/events/api/eventsApi";
import { getAuthHeaders } from "../../lib/authApi";
import {
  createVolunteerAssignment,
  getOrganizerVolunteerAssignments,
} from "../../features/volunteers/api/volunteersApi";

const API_BASE_URL = "http://localhost:3000";

type OrganizerEvent = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
};

type Volunteer = {
  id: string;
  fullName?: string;
  email?: string;
};

type VolunteerApplication = {
  id: string;
  volunteerId: string;
  eventId: string;
  status: string;
  reason?: string;
  availability?: string[];
  createdAt?: string;
  updatedAt?: string;
  volunteer?: Volunteer;
  event?: {
    id: string;
    title: string;
  };
};

type Assignment = {
  id: string;
  volunteerId: string;
  eventId: string;
  assignedRole: string;
  status: string;
  hoursWorked?: string;
  createdAt?: string;
  volunteer?: Volunteer;
  event?: {
    id: string;
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  };
};

type Overview = {
  totalVolunteers: number;
  pendingApplications: number;
  activeAssignments: number;
  completedTasks: number;
};

async function fetchJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
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

function getEventId(application: VolunteerApplication): string {
  return application.eventId || application.event?.id || "";
}

function getVolunteerName(volunteer?: Volunteer): string {
  return volunteer?.fullName || volunteer?.email || "Unknown volunteer";
}

function formatDate(date?: string): string {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function displayStatus(status: string): string {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Volunteers() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [overview, setOverview] = useState<Overview>({
    totalVolunteers: 0,
    pendingApplications: 0,
    activeAssignments: 0,
    completedTasks: 0,
  });

  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [assignedRole, setAssignedRole] = useState("");
  const [activeTab, setActiveTab] = useState<
    "assignments" | "applications"
  >("applications");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        overviewData,
        eventData,
        applicationData,
        assignmentData,
      ] = await Promise.all([
        fetchJson<Overview>("/volunteers/organizer/overview"),
        getMyEvents(),
        fetchJson<VolunteerApplication[]>(
          "/volunteers/organizer/applications",
        ),
        getOrganizerVolunteerAssignments(),
      ]);

      setOverview(overviewData);

      setEvents(
        eventData.map((event) => ({
          id: event.id,
          title: event.title,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status,
        })),
      );

      setApplications(applicationData);
      setAssignments(assignmentData as Assignment[]);

      setSelectedEventId((currentId) => {
        if (currentId && eventData.some((event) => event.id === currentId)) {
          return currentId;
        }

        return eventData[0]?.id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load volunteer information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const acceptedApplicants = useMemo(() => {
    const alreadyAssigned = new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.eventId === selectedEventId &&
            assignment.status !== "cancelled",
        )
        .map((assignment) => assignment.volunteerId),
    );

    const uniqueApplicants = new Map<string, VolunteerApplication>();

    applications.forEach((application) => {
      const volunteerId =
        application.volunteerId || application.volunteer?.id;

      if (
        getEventId(application) !== selectedEventId ||
        !["accepted", "approved"].includes(
          application.status.toLowerCase(),
        ) ||
        !volunteerId ||
        !application.volunteer ||
        alreadyAssigned.has(volunteerId)
      ) {
        return;
      }

      uniqueApplicants.set(volunteerId, application);
    });

    return Array.from(uniqueApplicants.values());
  }, [applications, assignments, selectedEventId]);

  useEffect(() => {
    setSelectedVolunteerId("");
  }, [selectedEventId]);

  async function reviewApplication(
    applicationId: string,
    status: "accepted" | "rejected",
  ) {
    setReviewingId(applicationId);
    setError("");
    setSuccess("");

    try {
      await fetchJson<VolunteerApplication>(
        `/volunteers/applications/${applicationId}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      setSuccess(
        status === "accepted"
          ? "Volunteer application accepted."
          : "Volunteer application rejected.",
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the application.",
      );
    } finally {
      setReviewingId("");
    }
  }

  async function assignVolunteer() {
    if (!selectedEventId || !selectedVolunteerId || !assignedRole.trim()) {
      setError("Select an event, an accepted applicant, and enter an assigned role.");
      return;
    }

    const isAcceptedApplicant = acceptedApplicants.some(
      (application) =>
        (application.volunteerId || application.volunteer?.id) ===
        selectedVolunteerId,
    );

    if (!isAcceptedApplicant) {
      setError(
        "Only accepted applicants for the selected event can be assigned.",
      );
      return;
    }

    setAssigning(true);
    setError("");
    setSuccess("");

    try {
      await createVolunteerAssignment({
        eventId: selectedEventId,
        volunteerId: selectedVolunteerId,
        assignedRole: assignedRole.trim(),
      });

      setSelectedVolunteerId("");
      setAssignedRole("");
      setSuccess("Volunteer assigned successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign the volunteer.",
      );
    } finally {
      setAssigning(false);
    }
  }

  const stats = [
    {
      label: "Total Volunteers",
      value: String(overview.totalVolunteers),
    },
    {
      label: "Pending Applications",
      value: String(overview.pendingApplications),
    },
    {
      label: "Active Assignments",
      value: String(overview.activeAssignments),
    },
    {
      label: "Completed Tasks",
      value: String(overview.completedTasks),
    },
  ];

  const selectedEvent = events.find(
    (event) => event.id === selectedEventId,
  );

  const selectedApplicant = acceptedApplicants.find(
    (application) =>
      (application.volunteerId || application.volunteer?.id) ===
      selectedVolunteerId,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">Volunteers</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Review applications and manage event volunteer assignments.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="font-semibold text-[#1E293B]">
            Assign Volunteer
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Only accepted applicants for the chosen event can be assigned.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="volunteer-event"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Event
            </label>
            <select
              id="volunteer-event"
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="accepted-volunteer"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Accepted applicant
            </label>
            <select
              id="accepted-volunteer"
              value={selectedVolunteerId}
              onChange={(event) =>
                setSelectedVolunteerId(event.target.value)
              }
              disabled={!selectedEventId || acceptedApplicants.length === 0}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="">
                {!selectedEventId
                  ? "Select an event first"
                  : acceptedApplicants.length === 0
                    ? "No unassigned accepted applicants"
                    : "Select an applicant"}
              </option>
              {acceptedApplicants.map((application) => {
                const volunteerId =
                  application.volunteerId || application.volunteer!.id;

                return (
                  <option key={application.id} value={volunteerId}>
                    {getVolunteerName(application.volunteer)}
                    {application.volunteer?.email
                      ? ` (${application.volunteer.email})`
                      : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="assigned-role"
              className="mb-2 block text-sm font-medium text-[#334155]"
            >
              Assigned role / task
            </label>
            <input
              id="assigned-role"
              type="text"
              value={assignedRole}
              onChange={(event) => setAssignedRole(event.target.value)}
              placeholder="e.g. Registration Desk, Gate Volunteer"
              maxLength={100}
              className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {selectedEvent && selectedApplicant && (
            <div className="rounded-lg bg-[#F8FAFC] p-3 text-sm text-[#475569] md:col-span-2">
              Assigning{" "}
              <span className="font-medium text-[#1E293B]">
                {getVolunteerName(selectedApplicant.volunteer)}
              </span>{" "}
              to{" "}
              <span className="font-medium text-[#1E293B]">
                {selectedEvent.title}
              </span>
              .
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={assignVolunteer}
              disabled={
                assigning ||
                !selectedEventId ||
                !selectedVolunteerId ||
                !assignedRole.trim()
              }
              className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {assigning ? "Assigning..." : "Assign Volunteer"}
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="font-semibold text-[#1E293B]">
            Volunteer Management
          </h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("applications")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                activeTab === "applications"
                  ? "bg-[#DBEAFE] text-[#1D4ED8]"
                  : "text-[#64748B] hover:bg-gray-100"
              }`}
            >
              Applications ({applications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("assignments")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                activeTab === "assignments"
                  ? "bg-[#DBEAFE] text-[#1D4ED8]"
                  : "text-[#64748B] hover:bg-gray-100"
              }`}
            >
              Assignments ({assignments.length})
            </button>
          </div>
        </div>

        {activeTab === "applications" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-650px text-left text-sm">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
                <tr>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Applied On</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {!loading && applications.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-[#64748B]"
                    >
                      No volunteer applications received yet.
                    </td>
                  </tr>
                )}

                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1E293B]">
                        {getVolunteerName(application.volunteer)}
                      </div>
                      {application.volunteer?.email && (
                        <div className="mt-1 text-xs text-[#64748B]">
                          {application.volunteer.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {application.event?.title ||
                        events.find(
                          (event) => event.id === getEventId(application),
                        )?.title ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {formatDate(
                        application.createdAt || application.updatedAt,
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={displayStatus(application.status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {application.status.toLowerCase() === "pending" ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            disabled={reviewingId === application.id}
                            onClick={() =>
                              reviewApplication(application.id, "accepted")
                            }
                            className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={reviewingId === application.id}
                            onClick={() =>
                              reviewApplication(application.id, "rejected")
                            }
                            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#64748B]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-650px text-left text-sm">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
                <tr>
                  <th className="px-4 py-3 font-medium">Volunteer</th>
                  <th className="px-4 py-3 font-medium">Assigned Role</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {!loading && assignments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-[#64748B]"
                    >
                      No volunteer assignments yet.
                    </td>
                  </tr>
                )}

                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-4 py-3 font-medium text-[#1E293B]">
                      {getVolunteerName(assignment.volunteer)}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {assignment.assignedRole}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {assignment.event?.title ||
                        events.find(
                          (event) => event.id === assignment.eventId,
                        )?.title ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {Number(assignment.hoursWorked || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={displayStatus(assignment.status)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">
          Volunteer Shift Reference
        </h3>
        <div className="flex flex-col divide-y divide-[#E2E8F0]">
          {volunteerShifts.map((shift) => (
            <div
              key={`${shift.location}-${shift.time}`}
              className="flex items-center justify-between gap-4 py-2.5 text-sm"
            >
              <span className="font-medium text-[#1E293B]">
                {shift.location}
              </span>
              <span className="text-[#64748B]">{shift.time}</span>
            </div>
          ))}
        </div>
      </section>

      {loading && (
        <p className="text-sm text-[#64748B]">
          Loading volunteer information...
        </p>
      )}
    </div>
  );
}

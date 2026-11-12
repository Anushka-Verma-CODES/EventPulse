
import { useCallback, useEffect, useMemo, useState } from "react";
import StatCard from "../../components/organizer/StatCard";
import StatusBadge from "../../components/organizer/StatusBadge";
import { getMyEvents } from "../../features/events/api/eventsApi";
import { getAuthHeaders } from "../../lib/authApi";
import {
  createVolunteerAssignment,
  getOrganizerVolunteerAssignments,
} from "../../features/volunteers/api/volunteersApi";

const VITE_API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : window.location.hostname === "172.16.78.105"
      ? "http://172.16.78.105:3000"
      : "https://eventpulse-toa3.onrender.com";

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

type EventGate = {
  id: string;
  eventId: string;
  name: string;
  code: string;
  capacity?: number | null;
  isActive: boolean;
};

type VolunteerApplication = {
  id: string;
  volunteerId: string;
  eventId: string;
  status: string;
  reason?: string;
  availability?: string[];
  preferredRole?: string;
  createdAt?: string;
  updatedAt?: string;
  volunteer?: Volunteer;
  event?: { id: string; title: string };
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

type ScannerAssignment = {
  id?: string;
  eventId?: string;
  scannerUserId?: string;
  userId?: string;
  volunteerId?: string;
  gateId?: string | null;
  gate?: EventGate | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  status?: string;
  scanner?: Volunteer;
  scannerUser?: Volunteer;
  volunteer?: Volunteer;
  user?: Volunteer;
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
  const response = await fetch(`${VITE_API_BASE_URL}${path}`, {
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function getEventId(application: VolunteerApplication): string {
  return application.eventId || application.event?.id || "";
}

function getVolunteerId(application: VolunteerApplication): string {
  return application.volunteerId || application.volunteer?.id || "";
}

function getVolunteerName(volunteer?: Volunteer): string {
  return volunteer?.fullName || volunteer?.email || "Unknown volunteer";
}

function formatDate(date?: string | null): string {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date?: string | null): string {
  if (!date) return "Not set";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not set";

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayStatus(status: string): string {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function scannerAssignmentUserId(
  assignment: ScannerAssignment,
): string {
  return (
    assignment.scannerUserId ||
    assignment.scanner?.id ||
    assignment.volunteerId ||
    assignment.userId ||
    assignment.scannerUser?.id ||
    assignment.volunteer?.id ||
    assignment.user?.id ||
    ""
  );
}

function scannerAssignmentName(
  assignment: ScannerAssignment,
): string {
  return getVolunteerName(
    assignment.scanner ||
      assignment.scannerUser ||
      assignment.volunteer ||
      assignment.user,
  );
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
    "applications" | "assignments" | "scanners"
  >("applications");

  const [scannerAssignments, setScannerAssignments] = useState<
    ScannerAssignment[]
  >([]);
  const [scannerVolunteerId, setScannerVolunteerId] = useState("");
  const [selectedGateId, setSelectedGateId] = useState("");
  const [eventGates, setEventGates] = useState<EventGate[]>([]);
  const [scannerStartsAt, setScannerStartsAt] = useState("");
  const [scannerEndsAt, setScannerEndsAt] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingScanners, setLoadingScanners] = useState(false);
  const [loadingGates, setLoadingGates] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [grantingScanner, setGrantingScanner] = useState(false);
  const [revokingScannerId, setRevokingScannerId] = useState("");
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedApplicationId, setExpandedApplicationId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewData, eventData, applicationData, assignmentData] =
        await Promise.all([
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
      const volunteerId = getVolunteerId(application);

      if (
        getEventId(application) !== selectedEventId ||
        !["accepted", "approved"].includes(application.status.toLowerCase()) ||
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

  const acceptedScannerApplicants = useMemo(() => {
    const activeScannerIds = new Set(
      scannerAssignments
        .filter((assignment) => assignment.isActive !== false)
        .map((assignment) => scannerAssignmentUserId(assignment))
        .filter(Boolean),
    );

    return applications.filter((application) => {
      const volunteerId = getVolunteerId(application);

      return (
        getEventId(application) === selectedEventId &&
        application.status.toLowerCase() === "accepted" &&
        !!volunteerId &&
        !!application.volunteer &&
        !activeScannerIds.has(volunteerId) &&
        ["scanner", "any role", "any_role"].includes(
          (application.preferredRole || "Any Role").toLowerCase(),
        )
      );
    });
  }, [applications, selectedEventId, scannerAssignments]);

  const selectedEvent = events.find(
    (event) => event.id === selectedEventId,
  );

  const selectedApplicant = acceptedApplicants.find(
    (application) => getVolunteerId(application) === selectedVolunteerId,
  );

  const selectedScannerGate = eventGates.find(
    (gate) => gate.id === selectedGateId && gate.isActive,
  );

  useEffect(() => {
    setSelectedVolunteerId("");
    setScannerVolunteerId("");
    setSelectedGateId("");
    setEventGates([]);
    setScannerAssignments([]);
  }, [selectedEventId]);

  const loadEventGates = useCallback(async () => {
    if (!selectedEventId) {
      setEventGates([]);
      setSelectedGateId("");
      return;
    }

    setLoadingGates(true);

    try {
      const data = await fetchJson<EventGate[]>(
        `/events/${selectedEventId}/gates`,
      );

      const activeGates = Array.isArray(data)
        ? data.filter((gate) => gate.isActive)
        : [];

      setEventGates(activeGates);

      setSelectedGateId((currentId) =>
        activeGates.some((gate) => gate.id === currentId)
          ? currentId
          : "",
      );
    } catch (err) {
      setEventGates([]);
      setSelectedGateId("");

      setError(
        err instanceof Error
          ? `Unable to load event gates: ${err.message}`
          : "Unable to load event gates.",
      );
    } finally {
      setLoadingGates(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    void loadEventGates();
  }, [loadEventGates]);

  const loadScannerAssignments = useCallback(async () => {
    if (!selectedEventId) {
      setScannerAssignments([]);
      return;
    }

    setLoadingScanners(true);

    try {
      const data = await fetchJson<ScannerAssignment[]>(
        `/volunteers/organizer/events/${selectedEventId}/scanners`,
      );

      setScannerAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Unable to load scanner assignments: ${err.message}`
          : "Unable to load scanner assignments.",
      );
    } finally {
      setLoadingScanners(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    void loadScannerAssignments();
  }, [loadScannerAssignments]);

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
      setError(
        "Select an event, an accepted applicant, and enter an assigned role.",
      );
      return;
    }

    const isAcceptedApplicant = acceptedApplicants.some(
      (application) => getVolunteerId(application) === selectedVolunteerId,
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
        err instanceof Error ? err.message : "Unable to assign the volunteer.",
      );
    } finally {
      setAssigning(false);
    }
  }

  async function grantScannerAccess() {
    if (!selectedEventId || !scannerVolunteerId) {
      setError("Select an event and an accepted volunteer.");
      return;
    }

    if (!selectedGateId || !selectedScannerGate) {
      setError("Select an active gate for this scanner.");
      return;
    }

    if (!scannerStartsAt || !scannerEndsAt) {
      setError("Set both the scanner access start and end date/time.");
      return;
    }

    const start = new Date(scannerStartsAt);
    const end = new Date(scannerEndsAt);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end.getTime() <= start.getTime()
    ) {
      setError("The access end date/time must be after the start date/time.");
      return;
    }

    const applicant = acceptedScannerApplicants.find(
      (application) => getVolunteerId(application) === scannerVolunteerId,
    );

    if (!applicant) {
      setError(
        "Scanner access can only be granted to an accepted applicant for this event.",
      );
      return;
    }

    setGrantingScanner(true);
    setError("");
    setSuccess("");

    try {
      await fetchJson(
        `/volunteers/organizer/events/${selectedEventId}/scanners`,
        {
          method: "POST",
          body: JSON.stringify({
            scannerUserId: scannerVolunteerId,
            gateId: selectedGateId,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
          }),
        },
      );

      setSuccess(
        `Scanner access granted to ${getVolunteerName(applicant.volunteer)} for ${selectedScannerGate.name}.`,
      );

      setScannerVolunteerId("");
      await loadScannerAssignments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to grant scanner access.",
      );
    } finally {
      setGrantingScanner(false);
    }
  }

  async function revokeScannerAccess(scannerUserId: string) {
    if (!selectedEventId || !scannerUserId) {
      setError("Unable to identify this scanner assignment.");
      return;
    }

    if (
      !window.confirm(
        "Revoke scanner access for this event? The volunteer will no longer be authorized to scan tickets for it.",
      )
    ) {
      return;
    }

    setRevokingScannerId(scannerUserId);
    setError("");
    setSuccess("");

    try {
      await fetchJson(
        `/volunteers/organizer/events/${selectedEventId}/scanners/${scannerUserId}`,
        { method: "DELETE" },
      );

      setSuccess("Scanner access revoked.");
      await loadScannerAssignments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to revoke scanner access.",
      );
    } finally {
      setRevokingScannerId("");
    }
  }

  const stats = [
    { label: "Total Volunteers", value: String(overview.totalVolunteers) },
    {
      label: "Pending Applications",
      value: String(overview.pendingApplications),
    },
    {
      label: "Active Assignments",
      value: String(overview.activeAssignments),
    },
    { label: "Completed Tasks", value: String(overview.completedTasks) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">Volunteers</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Review applications, assign volunteers, and manage event-specific
          scanner access.
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
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="font-semibold text-[#1E293B]">Assign Volunteer</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Only accepted applicants for the selected event can be assigned.
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
              onChange={(event) => setSelectedVolunteerId(event.target.value)}
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
              {acceptedApplicants.map((application) => (
                <option
                  key={application.id}
                  value={getVolunteerId(application)}
                >
                  {getVolunteerName(application.volunteer)}
                  {application.volunteer?.email
                    ? ` (${application.volunteer.email})`
                    : ""}
                </option>
              ))}
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

          <div className="flex flex-wrap gap-2">
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
            <button
              type="button"
              onClick={() => setActiveTab("scanners")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                activeTab === "scanners"
                  ? "bg-[#DBEAFE] text-[#1D4ED8]"
                  : "text-[#64748B] hover:bg-gray-100"
              }`}
            >
              Scanner Access ({scannerAssignments.length})
            </button>
          </div>
        </div>

        {activeTab === "applications" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
                <tr>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Preferred Role</th>
                  <th className="px-4 py-3 font-medium">Applied On</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {!loading && applications.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-[#64748B]"
                    >
                      No volunteer applications received yet.
                    </td>
                  </tr>
                )}

                {applications.map((application) => {
                  const expanded =
                    expandedApplicationId === application.id;

                  return (
                    <tr key={application.id}>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-[#1E293B]">
                          {getVolunteerName(application.volunteer)}
                        </div>
                        {application.volunteer?.email && (
                          <div className="mt-1 text-xs text-[#64748B]">
                            {application.volunteer.email}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedApplicationId(
                              expanded ? "" : application.id,
                            )
                          }
                          className="mt-2 text-xs font-medium text-blue-700 hover:underline"
                        >
                          {expanded ? "Hide application" : "Review details"}
                        </button>
                        {expanded && (
                          <div className="mt-3 max-w-xs space-y-2 rounded-lg bg-[#F8FAFC] p-3 text-xs text-[#475569]">
                            <p>
                              <strong>Reason:</strong>{" "}
                              {application.reason || "Not provided"}
                            </p>
                            <p>
                              <strong>Availability:</strong>{" "}
                              {application.availability?.length
                                ? application.availability.join(", ")
                                : "Not provided"}
                            </p>
                            <p>
                              <strong>Preferred role:</strong>{" "}
                              {application.preferredRole || "Any Role"}
                            </p>
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
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            (application.preferredRole || "Any Role").toLowerCase() ===
                            "scanner"
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {application.preferredRole || "Any Role"}
                        </span>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
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

        {activeTab === "scanners" && (
          <div className="space-y-6 p-5">
            <div>
              <h4 className="font-semibold text-[#1E293B]">
                Grant event scanner access
              </h4>
              <p className="mt-1 text-sm text-[#64748B]">
                Assign an accepted volunteer to one active gate and define
                exactly when they can scan tickets for the selected event.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="scanner-event"
                  className="mb-2 block text-sm font-medium text-[#334155]"
                >
                  Event
                </label>
                <select
                  id="scanner-event"
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

              <div className="md:col-span-2">
                <label
                  htmlFor="scanner-volunteer"
                  className="mb-2 block text-sm font-medium text-[#334155]"
                >
                  Accepted volunteer
                </label>
                <select
                  id="scanner-volunteer"
                  value={scannerVolunteerId}
                  onChange={(event) =>
                    setScannerVolunteerId(event.target.value)
                  }
                  disabled={
                    !selectedEventId ||
                    loadingScanners ||
                    acceptedScannerApplicants.length === 0
                  }
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
                >
                  <option value="">
                    {!selectedEventId
                      ? "Select an event first"
                      : loadingScanners
                        ? "Loading scanner assignments..."
                        : acceptedScannerApplicants.length === 0
                          ? "No eligible accepted applicants available"
                          : "Select a volunteer"}
                  </option>
                  {acceptedScannerApplicants.map((application) => (
                    <option
                      key={application.id}
                      value={getVolunteerId(application)}
                    >
                      {getVolunteerName(application.volunteer)} —{" "}
                      {application.preferredRole || "Any Role"}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[#64748B]">
                  Applicants choosing “Any Role” are also eligible for
                  consideration. Selecting a preference does not grant access
                  automatically.
                </p>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="scanner-gate"
                  className="mb-2 block text-sm font-medium text-[#334155]"
                >
                  Assign gate
                </label>
                <select
                  id="scanner-gate"
                  value={selectedGateId}
                  onChange={(event) => setSelectedGateId(event.target.value)}
                  disabled={
                    !selectedEventId ||
                    loadingGates ||
                    eventGates.length === 0
                  }
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
                >
                  <option value="">
                    {!selectedEventId
                      ? "Select an event first"
                      : loadingGates
                        ? "Loading gates..."
                        : eventGates.length === 0
                          ? "No active gates available"
                          : "Select a gate"}
                  </option>
                  {eventGates.map((gate) => (
                    <option key={gate.id} value={gate.id}>
                      {gate.name} ({gate.code})
                    </option>
                  ))}
                </select>

                {!loadingGates && selectedEventId && eventGates.length === 0 && (
                  <p className="mt-1 text-xs text-amber-700">
                    Create an active gate for this event before granting
                    scanner access.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="scanner-start"
                  className="mb-2 block text-sm font-medium text-[#334155]"
                >
                  Access starts
                </label>
                <input
                  id="scanner-start"
                  type="datetime-local"
                  value={scannerStartsAt}
                  onChange={(event) => setScannerStartsAt(event.target.value)}
                  required
                  className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="scanner-end"
                  className="mb-2 block text-sm font-medium text-[#334155]"
                >
                  Access ends
                </label>
                <input
                  id="scanner-end"
                  type="datetime-local"
                  value={scannerEndsAt}
                  onChange={(event) => setScannerEndsAt(event.target.value)}
                  required
                  className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {selectedEvent && (
                <div className="rounded-lg bg-[#F8FAFC] p-3 text-sm text-[#475569] md:col-span-2">
                  <p>
                    <strong>Event:</strong> {selectedEvent.title}
                  </p>
                  <p className="mt-1">
                    <strong>Event schedule:</strong>{" "}
                    {formatDateTime(selectedEvent.startDate)} –{" "}
                    {formatDateTime(selectedEvent.endDate)}
                  </p>
                  {selectedScannerGate && (
                    <p className="mt-1">
                      <strong>Assigned gate:</strong>{" "}
                      {selectedScannerGate.name} ({selectedScannerGate.code})
                    </p>
                  )}
                  <p className="mt-2 text-xs">
                    Each scanner is assigned to one gate for this event.
                    The backend must enforce the access time window for every
                    scan request.
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={grantScannerAccess}
                  disabled={
                    grantingScanner ||
                    loadingScanners ||
                    !selectedEventId ||
                    !scannerVolunteerId ||
                    !selectedGateId ||
                    !scannerStartsAt ||
                    !scannerEndsAt ||
                    loadingGates
                  }
                  className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {grantingScanner ? "Granting access..." : "Grant Scanner Access"}
                </button>
              </div>
            </div>

            <div className="border-t border-[#E2E8F0] pt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-[#1E293B]">
                    Scanner assignments
                  </h4>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Access assignments and assigned gates for the selected
                    event only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void loadScannerAssignments();
                    void loadEventGates();
                  }}
                  disabled={loadingScanners || !selectedEventId}
                  className="rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm font-medium text-[#334155] hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingScanners ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {!selectedEventId ? (
                <p className="py-6 text-center text-sm text-[#64748B]">
                  Select an event to view scanner assignments.
                </p>
              ) : loadingScanners ? (
                <p className="py-6 text-center text-sm text-[#64748B]">
                  Loading scanner assignments...
                </p>
              ) : scannerAssignments.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#64748B]">
                  No scanner assignments found for this event.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Scanner</th>
                        <th className="px-4 py-3 font-medium">Assigned Gate</th>
                        <th className="px-4 py-3 font-medium">Access starts</th>
                        <th className="px-4 py-3 font-medium">Access ends</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {scannerAssignments.map((assignment, index) => {
                        const userId = scannerAssignmentUserId(assignment);
                        const active =
                          assignment.isActive !== false &&
                          assignment.status?.toLowerCase() !== "revoked" &&
                          assignment.status?.toLowerCase() !== "inactive";

                        return (
                          <tr key={assignment.id || `${userId}-${index}`}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-[#1E293B]">
                                {scannerAssignmentName(assignment)}
                              </div>
                              {(assignment.scanner?.email ||
                                assignment.scannerUser?.email ||
                                assignment.volunteer?.email ||
                                assignment.user?.email) && (
                                <div className="mt-1 text-xs text-[#64748B]">
                                  {assignment.scanner?.email ||
                                    assignment.scannerUser?.email ||
                                    assignment.volunteer?.email ||
                                    assignment.user?.email}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[#64748B]">
                              {assignment.gate
                                ? `${assignment.gate.name} (${assignment.gate.code})`
                                : "Not assigned"}
                            </td>
                            <td className="px-4 py-3 text-[#64748B]">
                              {formatDateTime(assignment.startsAt)}
                            </td>
                            <td className="px-4 py-3 text-[#64748B]">
                              {formatDateTime(assignment.endsAt)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  active
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {active ? "Assigned" : "Revoked"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {active && userId ? (
                                <button
                                  type="button"
                                  disabled={revokingScannerId === userId}
                                  onClick={() =>
                                    void revokeScannerAccess(userId)
                                  }
                                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                                >
                                  {revokingScannerId === userId
                                    ? "Revoking..."
                                    : "Revoke access"}
                                </button>
                              ) : (
                                <span className="text-xs text-[#64748B]">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {loading && (
        <p className="text-sm text-[#64748B]">
          Loading volunteer information...
        </p>
      )}
    </div>
  );
}

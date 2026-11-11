
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthHeaders } from "../../lib/authApi";

const VITE_API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : window.location.hostname === "172.16.78.105"
      ? "http://172.16.78.105:3000"
      : "https://eventpulse-toa3.onrender.com";

const tabs = [
  "Overview",
  "Attendees",
  "Tickets",
  "Gates",
  "Volunteers",
  "Resources",
  "Incidents",
  "Reports",
];

type BackendEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  price: string | number;
  bannerImage: string | null;
  status: "draft" | "published" | "cancelled";
  organizerId: string;
  createdAt: string;
  updatedAt: string;
};

type EventGate = {
  id: string;
  eventId: string;
  name: string;
  code: string;
  capacity: number | null;
  isActive: boolean;
  createdAt?: string;
};

type EventAttendee = {
  id: string;
  attendeeId: string;
  eventId: string;
  name: string;
  email: string;
  ticket: string;
  eventName: string;
  registeredOn: string;
  status: string;
  checkedInAt: string | null;
};

type VolunteerApplication = {
  id: string;
  eventId: string;
  status: string;
  reason: string;
  preferredRole: string;
  availability: string[];
  createdAt: string;
  volunteer?: {
    id: string;
    fullName: string;
    email: string;
  };
};

type VolunteerAssignment = {
  id: string;
  eventId: string;
  assignedRole: string;
  status: string;
  hoursWorked: string;
  volunteer?: {
    id: string;
    fullName: string;
    email: string;
  };
};

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${VITE_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;

    throw new Error(
      message || `Request failed (${response.status}).`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function formatDateTime(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date and time unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusLabel({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const styles =
    normalizedStatus === "accepted" ||
    normalizedStatus === "assigned" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "checked in" ||
    normalizedStatus === "active"
      ? "bg-green-50 text-green-700"
      : normalizedStatus === "rejected" ||
          normalizedStatus === "cancelled" ||
          normalizedStatus === "inactive"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataError, setDataError] = useState("");

  const [publishing, setPublishing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [volunteerApplications, setVolunteerApplications] =
    useState<VolunteerApplication[]>([]);
  const [volunteerAssignments, setVolunteerAssignments] =
    useState<VolunteerAssignment[]>([]);

  // GATE MANAGEMENT
  const [gates, setGates] = useState<EventGate[]>([]);
  const [loadingGates, setLoadingGates] = useState(false);
  const [creatingGate, setCreatingGate] = useState(false);
  const [deactivatingGateId, setDeactivatingGateId] = useState("");

  const [gateName, setGateName] = useState("");
  const [gateCode, setGateCode] = useState("");
  const [gateCapacity, setGateCapacity] = useState("");

  const [gateError, setGateError] = useState("");
  const [gateSuccess, setGateSuccess] = useState("");

  // LOAD GATES
  const loadGates = useCallback(async () => {
    if (!eventId) {
      setGates([]);
      return;
    }

    setLoadingGates(true);
    setGateError("");

    try {
      const data = await apiRequest<EventGate[]>(
        `/events/${eventId}/gates`,
      );

      setGates(Array.isArray(data) ? data : []);
    } catch (err) {
      setGateError(
        err instanceof Error
          ? err.message
          : "Unable to load event gates.",
      );
    } finally {
      setLoadingGates(false);
    }
  }, [eventId]);

  // CREATE GATE
  async function createGate() {
    if (!eventId) {
      setGateError("Event ID is missing.");
      return;
    }

    const trimmedName = gateName.trim();
    const trimmedCode = gateCode.trim();

    if (!trimmedName || !trimmedCode) {
      setGateError("Enter both a gate name and gate code.");
      return;
    }

    if (
      gateCapacity.trim() &&
      (!Number.isInteger(Number(gateCapacity)) ||
        Number(gateCapacity) <= 0)
    ) {
      setGateError("Capacity must be a positive whole number.");
      return;
    }

    const duplicateCode = gates.some(
      (gate) =>
        gate.code.toLowerCase() === trimmedCode.toLowerCase(),
    );

    if (duplicateCode) {
      setGateError("A gate with this code already exists for this event.");
      return;
    }

    setCreatingGate(true);
    setGateError("");
    setGateSuccess("");

    try {
      await apiRequest<EventGate>(
        `/events/${eventId}/gates`,
        {
          method: "POST",
          body: JSON.stringify({
            name: trimmedName,
            code: trimmedCode,
            capacity: gateCapacity.trim()
              ? Number(gateCapacity)
              : undefined,
          }),
        },
      );

      setGateName("");
      setGateCode("");
      setGateCapacity("");

      setGateSuccess("Gate created successfully and is now active.");

      await loadGates();
    } catch (err) {
      setGateError(
        err instanceof Error
          ? err.message
          : "Unable to create gate.",
      );
    } finally {
      setCreatingGate(false);
    }
  }

  // DEACTIVATE GATE
  async function deactivateGate(gate: EventGate) {
    if (!gate.isActive) return;

    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${gate.name}"?`,
    );

    if (!confirmed) return;

    setDeactivatingGateId(gate.id);
    setGateError("");
    setGateSuccess("");

    try {
      await apiRequest(
        `/gates/${gate.id}/deactivate`,
        {
          method: "PATCH",
        },
      );

      setGateSuccess(`${gate.name} has been deactivated.`);

      await loadGates();
    } catch (err) {
      setGateError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate gate.",
      );
    } finally {
      setDeactivatingGateId("");
    }
  }

  // LOAD ATTENDEES AND VOLUNTEER DATA
  const loadEventData = useCallback(async () => {
    if (!eventId) return;

    setDataError("");

    const results = await Promise.allSettled([
      apiRequest<EventAttendee[]>(
        "/registrations/organizer/attendees",
      ),
      apiRequest<VolunteerApplication[]>(
        "/volunteers/organizer/applications",
      ),
      apiRequest<VolunteerAssignment[]>(
        "/volunteers/organizer/assignments",
      ),
    ]);

    const errors: string[] = [];

    if (results[0].status === "fulfilled") {
      setAttendees(
        results[0].value.filter(
          (attendee) => attendee.eventId === eventId,
        ),
      );
    } else {
      setAttendees([]);
      errors.push("Unable to load attendee information.");
    }

    if (results[1].status === "fulfilled") {
      setVolunteerApplications(
        results[1].value.filter(
          (application) => application.eventId === eventId,
        ),
      );
    } else {
      setVolunteerApplications([]);
      errors.push("Unable to load volunteer applications.");
    }

    if (results[2].status === "fulfilled") {
      setVolunteerAssignments(
        results[2].value.filter(
          (assignment) => assignment.eventId === eventId,
        ),
      );
    } else {
      setVolunteerAssignments([]);
      errors.push("Unable to load volunteer assignments.");
    }

    setDataError(errors.join(" "));
  }, [eventId]);

  // LOAD EVENT DETAILS
  const loadEvent = useCallback(async () => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<BackendEvent>(
        `/events/${eventId}`,
      );

      setEvent(data);

      await loadEventData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load event.",
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, loadEventData]);

  useEffect(() => {
    void loadEvent();
    void loadGates();
  }, [loadEvent, loadGates]);

  // PUBLISH DRAFT EVENT
  async function publishEvent() {
    if (
      !eventId ||
      !event ||
      event.status !== "draft" ||
      publishing ||
      cancelling
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to publish this draft event?",
    );

    if (!confirmed) return;

    setPublishing(true);
    setError("");

    try {
      await apiRequest<BackendEvent>(
        `/events/${eventId}/publish`,
        {
          method: "PATCH",
        },
      );

      await loadEvent();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish event.",
      );
    } finally {
      setPublishing(false);
    }
  }

  // CANCEL DRAFT OR PUBLISHED EVENT
  async function cancelEvent() {
    if (
      !eventId ||
      !event ||
      event.status === "cancelled" ||
      cancelling ||
      publishing
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel "${event.title}"? The event will remain in your event history, but it will no longer be available to attendees.`,
    );

    if (!confirmed) return;

    setCancelling(true);
    setError("");

    try {
      await apiRequest<BackendEvent>(
        `/events/${eventId}/cancel`,
        {
          method: "PATCH",
        },
      );

      await loadEvent();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel event.",
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-sm text-[#64748B]">
        Loading event...
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-700">{error}</p>

        <button
          type="button"
          onClick={() => void loadEvent()}
          className="mt-3 text-sm font-medium text-[#2563EB]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <p className="text-sm text-[#64748B]">
        Event not found.
      </p>
    );
  }

  const isDraft = event.status === "draft";
  const isPublished = event.status === "published";
  const isCancelled = event.status === "cancelled";

  const statusLabel =
    event.status.charAt(0).toUpperCase() +
    event.status.slice(1);

  const checkedInCount = attendees.filter(
    (attendee) =>
      attendee.status.toLowerCase() === "checked in",
  ).length;

  const remainingCapacity = Math.max(
    0,
    event.capacity - attendees.length,
  );

  const assignedVolunteerCount = volunteerAssignments.filter(
    (assignment) =>
      assignment.status.toLowerCase() !== "cancelled",
  ).length;

  const activeGateCount = gates.filter(
    (gate) => gate.isActive,
  ).length;

  return (
    <div>
      {/* EVENT HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            {event.title}
          </h2>

          <div className="mt-3 space-y-2 text-sm text-[#64748B]">
            <p>
              <span className="font-semibold text-[#1E293B]">
                Starts:
              </span>{" "}
              {formatDateTime(event.startDate)}
            </p>

            <p>
              <span className="font-semibold text-[#1E293B]">
                Ends:
              </span>{" "}
              {formatDateTime(event.endDate)}
            </p>

            <p>
              <span className="font-semibold text-[#1E293B]">
                Venue:
              </span>{" "}
              {event.location}
            </p>
          </div>

          <p className="mt-3 text-xs text-[#64748B]">
            Status:{" "}
            <span className="font-semibold">{statusLabel}</span>
            {" · "}
            {event.category}
          </p>
        </div>

        {/* EVENT ACTIONS */}
        <div className="flex flex-wrap gap-2">
          {!isCancelled && (
            <button
              type="button"
              onClick={() =>
                navigate(`/organizer/events/${event.id}/edit`)
              }
              disabled={publishing || cancelling}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit Event
            </button>
          )}

          {isDraft && (
            <button
              type="button"
              disabled={publishing || cancelling}
              onClick={() => void publishEvent()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish Event"}
            </button>
          )}

          {(isDraft || isPublished) && (
            <button
              type="button"
              disabled={cancelling || publishing}
              onClick={() => void cancelEvent()}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Event"}
            </button>
          )}

          {isPublished && (
            <button
              type="button"
              onClick={() => navigate(`/events/${event.id}`)}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              View Public Page
            </button>
          )}
        </div>
      </div>

      {isCancelled && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          This event has been cancelled. Editing and publishing are disabled.
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {dataError && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <span>{dataError}</span>

          <button
            type="button"
            onClick={() => void loadEventData()}
            className="font-semibold underline"
          >
            Retry loading data
          </button>
        </div>
      )}

      {/* EVENT STATISTICS */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {attendees.length}
          </div>

          <div className="mt-1 text-xs text-[#64748B]">
            Registrations
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {checkedInCount}
          </div>

          <div className="mt-1 text-xs text-[#64748B]">
            Checked In
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {remainingCapacity.toLocaleString("en-IN")}
          </div>

          <div className="mt-1 text-xs text-[#64748B]">
            Remaining Capacity
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {assignedVolunteerCount}
          </div>

          <div className="mt-1 text-xs text-[#64748B]">
            Assigned Volunteers
          </div>
        </div>
      </div>

      {/* EVENT TABS */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#E2E8F0]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            {tab}

            {tab === "Attendees" && (
              <span className="ml-2 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs">
                {attendees.length}
              </span>
            )}

            {tab === "Volunteers" && (
              <span className="ml-2 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs">
                {assignedVolunteerCount}
              </span>
            )}

            {tab === "Gates" && (
              <span className="ml-2 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs">
                {activeGateCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        {/* OVERVIEW */}
        {activeTab === "Overview" && (
          <div className="space-y-5 text-sm text-[#64748B]">
            <div>
              <h3 className="font-semibold text-[#1E293B]">
                Description
              </h3>

              <p className="mt-1 whitespace-pre-wrap">
                {event.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#1E293B]">
                Event details
              </h3>

              <p className="mt-2">
                Category: {event.category}
              </p>

              <p className="mt-2">
                Venue: {event.location}
              </p>

              <p className="mt-2">
                Starts: {formatDateTime(event.startDate)}
              </p>

              <p className="mt-2">
                Ends: {formatDateTime(event.endDate)}
              </p>

              <p className="mt-2">
                Capacity: {event.capacity.toLocaleString("en-IN")}
              </p>

              <p className="mt-2">
                Ticket price: ₹
                {Number(event.price).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}

        {/* ATTENDEES */}
        {activeTab === "Attendees" && (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[#1E293B]">
                  Event attendees
                </h3>

                <p className="mt-1 text-sm text-[#64748B]">
                  People registered for {event.title}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadEventData()}
                className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-medium text-[#475569] hover:bg-[#F8FAFC]"
              >
                Refresh
              </button>
            </div>

            {attendees.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
                <p className="font-medium text-[#334155]">
                  No attendees registered yet.
                </p>

                <p className="mt-1 text-sm text-[#64748B]">
                  Registered attendees will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
                      <th className="px-3 py-3 font-medium">Attendee</th>
                      <th className="px-3 py-3 font-medium">Ticket</th>
                      <th className="px-3 py-3 font-medium">Registered</th>
                      <th className="px-3 py-3 font-medium">
                        Check-in status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendees.map((attendee) => (
                      <tr
                        key={attendee.id}
                        className="border-b border-[#F1F5F9] last:border-0"
                      >
                        <td className="px-3 py-4">
                          <p className="font-medium text-[#1E293B]">
                            {attendee.name || "Unknown attendee"}
                          </p>

                          <p className="mt-1 text-xs text-[#64748B]">
                            {attendee.email}
                          </p>
                        </td>

                        <td className="px-3 py-4 font-medium text-[#334155]">
                          {attendee.ticket}
                        </td>

                        <td className="px-3 py-4 text-[#64748B]">
                          {formatDate(attendee.registeredOn)}
                        </td>

                        <td className="px-3 py-4">
                          <StatusLabel status={attendee.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* GATES */}
        {activeTab === "Gates" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#1E293B]">
                  Event Gate Management
                </h3>

                <p className="mt-1 text-sm text-[#64748B]">
                  Create and manage entry gates for {event.title}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadGates()}
                disabled={loadingGates}
                className="rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                {loadingGates ? "Refreshing..." : "Refresh Gates"}
              </button>
            </div>

            {gateError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {gateError}
              </div>
            )}

            {gateSuccess && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {gateSuccess}
              </div>
            )}

            {/* CREATE GATE FORM */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <h4 className="font-semibold text-[#1E293B]">
                Create a new gate
              </h4>

              <p className="mt-1 text-sm text-[#64748B]">
                New gates are active by default and can immediately be
                assigned to a scanner.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="gate-name"
                    className="mb-2 block text-sm font-medium text-[#334155]"
                  >
                    Gate name
                  </label>

                  <input
                    id="gate-name"
                    type="text"
                    value={gateName}
                    onChange={(e) => setGateName(e.target.value)}
                    placeholder="e.g. Main Gate"
                    maxLength={100}
                    disabled={creatingGate || isCancelled}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gate-code"
                    className="mb-2 block text-sm font-medium text-[#334155]"
                  >
                    Gate code
                  </label>

                  <input
                    id="gate-code"
                    type="text"
                    value={gateCode}
                    onChange={(e) =>
                      setGateCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. GATE-01"
                    maxLength={30}
                    disabled={creatingGate || isCancelled}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gate-capacity"
                    className="mb-2 block text-sm font-medium text-[#334155]"
                  >
                    Capacity (optional)
                  </label>

                  <input
                    id="gate-capacity"
                    type="number"
                    min="1"
                    step="1"
                    value={gateCapacity}
                    onChange={(e) => setGateCapacity(e.target.value)}
                    placeholder="e.g. 100"
                    disabled={creatingGate || isCancelled}
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />

                  <p className="mt-1 text-xs text-[#64748B]">
                    Optional maximum capacity for this gate.
                  </p>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => void createGate()}
                    disabled={
                      creatingGate ||
                      isCancelled ||
                      !gateName.trim() ||
                      !gateCode.trim()
                    }
                    className="w-full rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingGate ? "Creating Gate..." : "Create Gate"}
                  </button>
                </div>
              </div>

              {isCancelled && (
                <p className="mt-3 text-xs text-red-600">
                  Gates cannot be created for a cancelled event.
                </p>
              )}
            </div>

            {/* GATE LIST */}
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-[#1E293B]">
                    Existing gates
                  </h4>

                  <p className="mt-1 text-sm text-[#64748B]">
                    {activeGateCount} active gate
                    {activeGateCount !== 1 ? "s" : ""} for this event.
                  </p>
                </div>
              </div>

              {loadingGates ? (
                <div className="py-8 text-center text-sm text-[#64748B]">
                  Loading event gates...
                </div>
              ) : gates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
                  <p className="font-medium text-[#334155]">
                    No gates created yet.
                  </p>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Create your first gate above to start assigning scanners.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
                        <th className="px-4 py-3 font-medium">Gate name</th>
                        <th className="px-4 py-3 font-medium">Gate code</th>
                        <th className="px-4 py-3 font-medium">Capacity</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E2E8F0]">
                      {gates.map((gate) => (
                        <tr key={gate.id}>
                          <td className="px-4 py-4 font-medium text-[#1E293B]">
                            {gate.name}
                          </td>

                          <td className="px-4 py-4 text-[#64748B]">
                            {gate.code}
                          </td>

                          <td className="px-4 py-4 text-[#64748B]">
                            {gate.capacity ?? "Not specified"}
                          </td>

                          <td className="px-4 py-4">
                            <StatusLabel
                              status={gate.isActive ? "Active" : "Inactive"}
                            />
                          </td>

                          <td className="px-4 py-4">
                            {gate.isActive ? (
                              <button
                                type="button"
                                disabled={
                                  deactivatingGateId === gate.id
                                }
                                onClick={() =>
                                  void deactivateGate(gate)
                                }
                                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                              >
                                {deactivatingGateId === gate.id
                                  ? "Deactivating..."
                                  : "Deactivate"}
                              </button>
                            ) : (
                              <span className="text-xs text-[#94A3B8]">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-semibold">Scanner assignment</p>
              <p className="mt-1">
                Once a gate is created and active, open Volunteers → Scanner
                Access. It will appear in the gate selection dropdown for
                this event.
              </p>
            </div>
          </div>
        )}

        {/* VOLUNTEERS */}
        {activeTab === "Volunteers" && (
          <div className="space-y-8">
            {/* ASSIGNED VOLUNTEERS */}
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-[#1E293B]">
                  Assigned volunteers
                </h3>

                <p className="mt-1 text-sm text-[#64748B]">
                  Volunteers assigned to work at this event.
                </p>
              </div>

              {volunteerAssignments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center text-sm text-[#64748B]">
                  No volunteers have been assigned to this event yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
                        <th className="px-3 py-3 font-medium">
                          Volunteer
                        </th>
                        <th className="px-3 py-3 font-medium">
                          Assigned role
                        </th>
                        <th className="px-3 py-3 font-medium">Hours</th>
                        <th className="px-3 py-3 font-medium">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {volunteerAssignments.map((assignment) => (
                        <tr
                          key={assignment.id}
                          className="border-b border-[#F1F5F9] last:border-0"
                        >
                          <td className="px-3 py-4">
                            <p className="font-medium text-[#1E293B]">
                              {assignment.volunteer?.fullName ||
                                "Volunteer"}
                            </p>

                            <p className="mt-1 text-xs text-[#64748B]">
                              {assignment.volunteer?.email || "—"}
                            </p>
                          </td>

                          <td className="px-3 py-4 text-[#475569]">
                            {assignment.assignedRole}
                          </td>

                          <td className="px-3 py-4 text-[#475569]">
                            {Number(
                              assignment.hoursWorked || 0,
                            ).toFixed(1)}
                          </td>

                          <td className="px-3 py-4">
                            <StatusLabel status={assignment.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* VOLUNTEER APPLICATIONS */}
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-[#1E293B]">
                  Volunteer applications
                </h3>

                <p className="mt-1 text-sm text-[#64748B]">
                  Applications received for this event.
                </p>
              </div>

              {volunteerApplications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center text-sm text-[#64748B]">
                  No volunteer applications received yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {volunteerApplications.map((application) => (
                    <div
                      key={application.id}
                      className="rounded-xl border border-[#E2E8F0] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#1E293B]">
                            {application.volunteer?.fullName ||
                              "Volunteer"}
                          </p>

                          <p className="mt-1 text-xs text-[#64748B]">
                            {application.volunteer?.email || "—"}
                          </p>
                        </div>

                        <StatusLabel status={application.status} />
                      </div>

                      <p className="mt-3 text-sm text-[#475569]">
                        {application.reason}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#64748B]">
                        <span className="rounded-full bg-[#F1F5F9] px-3 py-1">
                          Preferred role: {application.preferredRole}
                        </span>

                        {(application.availability || []).map(
                          (availability) => (
                            <span
                              key={availability}
                              className="rounded-full bg-[#F1F5F9] px-3 py-1"
                            >
                              {availability}
                            </span>
                          ),
                        )}
                      </div>

                      <p className="mt-3 text-xs text-[#94A3B8]">
                        Applied on {formatDate(application.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* OTHER TABS */}
        {activeTab !== "Overview" &&
          activeTab !== "Attendees" &&
          activeTab !== "Gates" &&
          activeTab !== "Volunteers" && (
            <p className="text-sm text-[#64748B]">
              {activeTab} for this event isn't connected to real data yet.
            </p>
          )}
      </div>
    </div>
  );
}

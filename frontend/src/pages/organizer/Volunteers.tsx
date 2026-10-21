
import { useEffect, useState } from "react";
import StatCard from "../../components/organizer/StatCard";
import StatusBadge from "../../components/organizer/StatusBadge";
import {
  volunteerOverview,
  volunteerShifts,
} from "../../lib/organizerMockData";
import { getMyEvents } from "../../features/events/api/eventsApi";
import {
  createVolunteerAssignment,
  getOrganizerVolunteerAssignments,
} from "../../features/volunteers/api/volunteersApi";
import type { VolunteerAssignment } from "../../features/volunteers/api/volunteersApi";
import { getAuthHeaders } from "../../lib/authApi";

const API_BASE_URL = "http://localhost:3000";

type OrganizerEventOption = {
  id: string;
  title: string;
  location?: string;
  startDate?: string;
};

type ApplicationStatus = "pending" | "accepted" | "rejected";

type OrganizerApplication = {
  id: string;
  volunteerId: string;
  eventId: string;
  reason: string;
  availability: string[];
  status: ApplicationStatus;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startDate?: string;
    organizerId?: string;
  };
  volunteer: {
    id: string;
    fullName?: string;
    email?: string;
  };
};

export default function Volunteers() {
  const [events, setEvents] = useState<OrganizerEventOption[]>([]);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);

  const [eventId, setEventId] = useState("");
  const [volunteerId, setVolunteerId] = useState("");
  const [assignedRole, setAssignedRole] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewingApplicationId, setReviewingApplicationId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAssignments() {
    const data = await getOrganizerVolunteerAssignments();
    setAssignments(data);
  }

  async function loadApplications() {
    const response = await fetch(
      `${API_BASE_URL}/volunteers/organizer/applications`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      const responseData = await response.json().catch(() => null);
      const message = responseData?.message;

      throw new Error(
        Array.isArray(message)
          ? message.join(" ")
          : message || "Unable to load volunteer applications.",
      );
    }

    const data: OrganizerApplication[] = await response.json();
    setApplications(data);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadPageData() {
      try {
        const [eventData, assignmentData] = await Promise.all([
          getMyEvents(),
          getOrganizerVolunteerAssignments(),
        ]);

        if (!isMounted) return;

        setEvents(eventData);
        setAssignments(assignmentData);

        const response = await fetch(
          `${API_BASE_URL}/volunteers/organizer/applications`,
          {
            headers: getAuthHeaders(),
          },
        );

        if (!response.ok) {
          const responseData = await response.json().catch(() => null);
          const message = responseData?.message;

          throw new Error(
            Array.isArray(message)
              ? message.join(" ")
              : message || "Unable to load volunteer applications.",
          );
        }

        const applicationData: OrganizerApplication[] =
          await response.json();

        if (isMounted) {
          setApplications(applicationData);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load volunteer management data.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const acceptedApplications = applications.filter(
    (application) =>
      application.eventId === eventId &&
      application.status === "accepted",
  );

  async function handleAssignVolunteer() {
    setError("");
    setSuccess("");

    if (!eventId || !volunteerId || !assignedRole.trim()) {
      setError(
        "Select an event, select an accepted volunteer, and enter an assigned role.",
      );
      return;
    }

    const hasAcceptedApplication = acceptedApplications.some(
      (application) => application.volunteerId === volunteerId,
    );

    if (!hasAcceptedApplication) {
      setError(
        "Only volunteers with accepted applications for the selected event can be assigned.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createVolunteerAssignment({
        eventId,
        volunteerId,
        assignedRole: assignedRole.trim(),
      });

      await loadAssignments();

      setSuccess("Volunteer assigned successfully.");
      setVolunteerId("");
      setAssignedRole("");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign or refresh volunteer assignments.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReviewApplication(
    applicationId: string,
    status: "accepted" | "rejected",
  ) {
    setError("");
    setSuccess("");
    setReviewingApplicationId(applicationId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/volunteers/applications/${applicationId}/review`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        const responseData = await response.json().catch(() => null);
        const message = responseData?.message;

        throw new Error(
          Array.isArray(message)
            ? message.join(" ")
            : message || "Unable to review this application.",
        );
      }

      await Promise.all([loadApplications(), loadAssignments()]);

      setSuccess(
        status === "accepted"
          ? "Volunteer application accepted. You can now assign a task."
          : "Volunteer application rejected.",
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to review this application.",
      );
    } finally {
      setReviewingApplicationId("");
    }
  }

  function getVolunteerName(assignment: VolunteerAssignment) {
    const volunteer = assignment.volunteer;

    if (volunteer && typeof volunteer === "object") {
      return volunteer.fullName ?? volunteer.email ?? "Volunteer";
    }

    return "Volunteer";
  }

  function getApplicationVolunteerName(
    application: OrganizerApplication,
  ) {
    return (
      application.volunteer?.fullName ??
      application.volunteer?.email ??
      "Volunteer"
    );
  }

  function getAssignmentStatus(status: VolunteerAssignment["status"]) {
    switch (status) {
      case "assigned":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  }

  function getApplicationStatus(status: ApplicationStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Volunteers</h2>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {volunteerOverview.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1E293B]">
          Assign Volunteer
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          Assign a task to a volunteer whose application has been accepted
          for the selected event.
        </p>

        {isLoading ? (
          <p className="mt-4 text-sm text-[#64748B]">
            Loading events and volunteers...
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="assignment-event"
                className="mb-1.5 block text-sm font-medium text-[#334155]"
              >
                Event
              </label>

              <select
                id="assignment-event"
                value={eventId}
                onChange={(event) => {
                  setEventId(event.target.value);
                  setVolunteerId("");
                }}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#2563EB]"
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>

              {events.length === 0 && (
                <p className="mt-1.5 text-xs text-[#64748B]">
                  You need to create an event before assigning volunteers.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="assignment-volunteer"
                className="mb-1.5 block text-sm font-medium text-[#334155]"
              >
                Accepted Volunteer
              </label>

              <select
                id="assignment-volunteer"
                value={volunteerId}
                onChange={(event) => setVolunteerId(event.target.value)}
                disabled={!eventId || acceptedApplications.length === 0}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
              >
                <option value="">Select a volunteer</option>
                {acceptedApplications.map((application) => (
                  <option
                    key={application.id}
                    value={application.volunteerId}
                  >
                    {getApplicationVolunteerName(application)}
                    {application.volunteer?.email
                      ? ` (${application.volunteer.email})`
                      : ""}
                  </option>
                ))}
              </select>

              {eventId && acceptedApplications.length === 0 && (
                <p className="mt-1.5 text-xs text-[#64748B]">
                  No accepted applications for this event yet.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="assignment-role"
                className="mb-1.5 block text-sm font-medium text-[#334155]"
              >
                Assigned Role / Task
              </label>

              <input
                id="assignment-role"
                type="text"
                value={assignedRole}
                onChange={(event) => setAssignedRole(event.target.value)}
                placeholder="e.g. Registration Desk, Crowd Management"
                maxLength={100}
                className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleAssignVolunteer}
                disabled={
                  isSubmitting ||
                  !eventId ||
                  !volunteerId ||
                  !assignedRole.trim()
                }
                className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Assigning..." : "Assign Volunteer"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-5 py-3 text-sm font-semibold text-[#1E293B]">
          Volunteers
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Shift</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0]">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-4 py-3 font-medium text-[#1E293B]">
                    {getVolunteerName(assignment)}
                  </td>

                  <td className="px-4 py-3 text-[#64748B]">
                    {assignment.assignedRole}
                  </td>

                  <td className="px-4 py-3 text-[#64748B]">
                    {assignment.event?.title ?? "Event"}
                  </td>

                  <td className="px-4 py-3 text-[#64748B]">
                    {assignment.event?.startDate
                      ? new Date(assignment.event.startDate).toLocaleString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                            timeZone: "Asia/Kolkata",
                          },
                        )
                      : "Not specified"}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      status={getAssignmentStatus(assignment.status)}
                    />
                  </td>
                </tr>
              ))}

              {!isLoading && assignments.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-[#64748B]"
                  >
                    No volunteer assignments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-5 py-3 text-sm font-semibold text-[#1E293B]">
          Applications
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
              <tr>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Applied On</th>
                <th className="px-4 py-3 font-medium">Availability</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0]">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-4 py-3 font-medium text-[#1E293B]">
                    <div>{getApplicationVolunteerName(application)}</div>
                    {application.volunteer?.email && (
                      <div className="mt-1 text-xs font-normal text-[#64748B]">
                        {application.volunteer.email}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-[#64748B]">
                    {application.event?.title ?? "Event"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-[#64748B]">
                    {formatDate(application.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-[#64748B]">
                    {application.availability?.join(", ") || "—"}
                  </td>

                  <td className="max-w-xs px-4 py-3 text-[#64748B]">
                    <p className="whitespace-normal">{application.reason}</p>
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      status={getApplicationStatus(application.status)}
                    />
                  </td>

                  <td className="px-4 py-3">
                    {application.status === "pending" ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleReviewApplication(application.id, "accepted")
                          }
                          disabled={reviewingApplicationId === application.id}
                          className="text-xs font-medium text-[#16A34A] hover:underline disabled:opacity-50"
                        >
                          {reviewingApplicationId === application.id
                            ? "Processing..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleReviewApplication(application.id, "rejected")
                          }
                          disabled={reviewingApplicationId === application.id}
                          className="text-xs font-medium text-[#DC2626] hover:underline disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#64748B]">
                        Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {!isLoading && applications.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-[#64748B]"
                  >
                    No volunteer applications yet.
                  </td>
                </tr>
              )}

              {isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-[#64748B]"
                  >
                    Loading applications...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">
          Volunteer Shifts
        </h3>

        <div className="flex flex-col divide-y divide-[#E2E8F0]">
          {volunteerShifts.map((shift) => (
            <div
              key={shift.location}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <span className="font-medium text-[#1E293B]">
                {shift.location}
              </span>
              <span className="text-[#64748B]">{shift.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

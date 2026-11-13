
import { useEffect, useState } from "react";
import StatusBadge from "../../components/volunteer/StatusBadge";
import {
  getMyVolunteerAssignments,
  updateMyVolunteerAssignment,
} from "../../features/volunteers/api/volunteersApi";
import type {
  VolunteerAssignment,
  UpdateVolunteerAssignmentInput,
} from "../../features/volunteers/api/volunteersApi";

const filters = ["All", "Pending", "Completed"];

function formatDateTime(value: string | null) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export default function MyTasks() {
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      try {
        const data = await getMyVolunteerAssignments();

        if (isMounted) {
          setAssignments(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your assignments.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateAssignment(
    assignment: VolunteerAssignment,
    status: UpdateVolunteerAssignmentInput["status"],
  ) {
    if (updatingAssignmentId) return;

    setError("");
    setSuccess("");
    setUpdatingAssignmentId(assignment.id);

    try {
      const updated = await updateMyVolunteerAssignment(assignment.id, {
        status,
      });

      setAssignments((previous) =>
        previous.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );

      const messages: Record<
        UpdateVolunteerAssignmentInput["status"],
        string
      > = {
        accepted: "Assignment accepted successfully.",
        declined: "Assignment declined.",
        in_progress: "Your shift has started.",
        completed: "Your shift has ended. Your hours were calculated automatically.",
      };

      setSuccess(messages[status]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this assignment.",
      );
    } finally {
      setUpdatingAssignmentId("");
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (
      assignment.status === "cancelled" ||
      assignment.status === "declined"
    ) {
      return false;
    }

    if (activeFilter === "Pending") {
      return (
        assignment.status === "pending_acceptance" ||
        assignment.status === "accepted" ||
        assignment.status === "assigned" ||
        assignment.status === "in_progress"
      );
    }

    if (activeFilter === "Completed") {
      return assignment.status === "completed";
    }

    return true;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">My Tasks</h2>

      <p className="mt-1 text-sm text-[#64748B]">
        View your assigned shifts, manage your participation, and track your
        volunteer hours.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 text-sm text-[#64748B] shadow-sm">
          Loading your assignments...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B] shadow-sm">
          {assignments.length === 0
            ? "You don't have any assignments yet. Assignments from organizers will appear here."
            : `No ${activeFilter.toLowerCase()} assignments found.`}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {filteredAssignments.map((assignment) => {
            const event = assignment.event;
            const isUpdating = updatingAssignmentId === assignment.id;

            const statusLabels: Record<string, string> = {
              pending_acceptance: "Awaiting Response",
              accepted: "Accepted",
              assigned: "Assigned",
              in_progress: "In Progress",
              completed: "Completed",
              declined: "Declined",
              cancelled: "Cancelled",
            };

            const statusLabel =
              statusLabels[assignment.status] ?? assignment.status;

            return (
              <div
                key={assignment.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#1E293B]">
                    {event?.title ?? "Event"}
                  </h3>

                  <StatusBadge status={statusLabel} />
                </div>

                <p className="mt-1 text-sm text-[#64748B]">
                  {event?.location ?? "Location unavailable"}
                </p>

                <p className="mt-3 text-sm text-[#334155]">
                  Assigned role: {assignment.assignedRole}
                </p>

                <div className="mt-3 grid gap-2 text-sm text-[#64748B]">
                  <p>
                    <span className="font-medium text-[#334155]">
                      Scheduled start:
                    </span>{" "}
                    {formatDateTime(assignment.scheduledStartAt)}
                  </p>

                  <p>
                    <span className="font-medium text-[#334155]">
                      Scheduled end:
                    </span>{" "}
                    {formatDateTime(assignment.scheduledEndAt)}
                  </p>

                  {assignment.actualStartedAt && (
                    <p>
                      <span className="font-medium text-[#334155]">
                        Actual start:
                      </span>{" "}
                      {formatDateTime(assignment.actualStartedAt)}
                    </p>
                  )}

                  {assignment.actualEndedAt && (
                    <p>
                      <span className="font-medium text-[#334155]">
                        Actual end:
                      </span>{" "}
                      {formatDateTime(assignment.actualEndedAt)}
                    </p>
                  )}
                </div>

                {assignment.status === "completed" && (
                  <div className="mt-4 rounded-lg bg-[#F8FAFC] p-3">
                    <p className="text-sm font-semibold text-[#1E293B]">
                      Hours worked: {Number(assignment.hoursWorked).toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Hours approval:{" "}
                      {assignment.hoursApprovalStatus === "approved"
                        ? "Approved"
                        : assignment.hoursApprovalStatus === "flagged"
                          ? "Flagged for organizer review"
                          : "Pending organizer approval"}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {assignment.status === "pending_acceptance" && (
                    <>
                      <button
                        type="button"
                        disabled={Boolean(updatingAssignmentId)}
                        onClick={() =>
                          updateAssignment(assignment, "accepted")
                        }
                        className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isUpdating ? "Updating..." : "Accept Assignment"}
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(updatingAssignmentId)}
                        onClick={() =>
                          updateAssignment(assignment, "declined")
                        }
                        className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {assignment.status === "accepted" && (
                    <button
                      type="button"
                      disabled={Boolean(updatingAssignmentId)}
                      onClick={() =>
                        updateAssignment(assignment, "in_progress")
                      }
                      className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdating ? "Updating..." : "Start Shift"}
                    </button>
                  )}

                  {assignment.status === "in_progress" && (
                    <button
                      type="button"
                      disabled={Boolean(updatingAssignmentId)}
                      onClick={() =>
                        updateAssignment(assignment, "completed")
                      }
                      className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdating ? "Updating..." : "End Shift"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

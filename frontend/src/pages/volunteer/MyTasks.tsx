import { useEffect, useState } from "react";
import StatusBadge from "../../components/volunteer/StatusBadge";
import {
  getMyVolunteerAssignments,
  updateMyVolunteerAssignment,
} from "../../features/volunteers/api/volunteersApi";
import type { VolunteerAssignment } from "../../features/volunteers/api/volunteersApi";

const filters = ["All", "Pending", "Completed"];

export default function MyTasks() {
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [hoursDrafts, setHoursDrafts] = useState<Record<string, string>>({});
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

        if (!isMounted) return;

        setAssignments(data);
        setHoursDrafts(
          Object.fromEntries(
            data.map((assignment) => [
              assignment.id,
              String(assignment.hoursWorked ?? "0"),
            ]),
          ),
        );
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your assignments.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  async function updateAssignment(
    assignment: VolunteerAssignment,
    status: "in_progress" | "completed",
  ) {
    if (updatingAssignmentId) return;

    setError("");
    setSuccess("");

    let hoursWorked: number | undefined;

    if (status === "completed") {
      const hoursValue = hoursDrafts[assignment.id] ?? "";
      hoursWorked = Number(hoursValue);

      if (
        hoursValue.trim() === "" ||
        !Number.isFinite(hoursWorked) ||
        hoursWorked < 0 ||
        hoursWorked > 9999
      ) {
        setError("Enter valid volunteer hours between 0 and 9999.");
        return;
      }
    }

    setUpdatingAssignmentId(assignment.id);

    try {
      const updated = await updateMyVolunteerAssignment(assignment.id, {
        status,
        ...(status === "completed" ? { hoursWorked } : {}),
      });

      setAssignments((previous) =>
        previous.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );

      setHoursDrafts((previous) => ({
        ...previous,
        [updated.id]: String(updated.hoursWorked ?? "0"),
      }));

      setSuccess(
        status === "completed"
          ? "Assignment marked as completed."
          : "Assignment started.",
      );
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
  if (assignment.status === "cancelled") {
    return false;
  }

  if (activeFilter === "Pending") {
    return (
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
        View your assigned events and update your task progress.
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
            const isActive =
              assignment.status === "assigned" ||
              assignment.status === "in_progress";

            const statusLabel =
              assignment.status === "in_progress"
                ? "In Progress"
                : assignment.status === "completed"
                  ? "Completed"
                  : assignment.status === "cancelled"
                    ? "Cancelled"
                    : "Pending";

            return (
              <div
                key={assignment.id}
                className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#1E293B]">
                      {event?.title ?? "Event"}
                    </h3>
                    <StatusBadge status={statusLabel} />
                  </div>

                  <p className="mt-1 text-sm text-[#64748B]">
                    {event?.location ?? "Location unavailable"}
                  </p>

                  {event?.startDate && (
                    <p className="mt-2 text-xs text-[#64748B]">
                      Event date:{" "}
                      {new Date(event.startDate).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-[#334155]">
                    Assigned role: {assignment.assignedRole}
                  </p>

                  {assignment.status === "completed" && (
                    <p className="mt-2 text-sm text-[#64748B]">
                      Hours worked: {assignment.hoursWorked ?? 0}
                    </p>
                  )}

                  {isActive && (
                    <div className="mt-4 flex flex-col items-start gap-3">
                      {assignment.status === "in_progress" && (
                        <div>
                          <label
                            htmlFor={`hours-${assignment.id}`}
                            className="mb-1 block text-xs text-[#64748B]"
                          >
                            Hours worked upon completion
                          </label>
                          <input
                            id={`hours-${assignment.id}`}
                            type="number"
                            min="0"
                            max="9999"
                            step="0.25"
                            value={hoursDrafts[assignment.id] ?? ""}
                            onChange={(event) =>
                              setHoursDrafts((previous) => ({
                                ...previous,
                                [assignment.id]: event.target.value,
                              }))
                            }
                            className="w-40 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {assignment.status === "assigned" && (
                          <button
                            type="button"
                            disabled={Boolean(updatingAssignmentId)}
                            onClick={() =>
                              updateAssignment(assignment, "in_progress")
                            }
                            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isUpdating ? "Updating..." : "Start Assignment"}
                          </button>
                        )}

                        {assignment.status === "in_progress" && (
                          <button
                            type="button"
                            disabled={Boolean(updatingAssignmentId)}
                            onClick={() =>
                              updateAssignment(assignment, "completed")
                            }
                            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-50"
                          >
                            {isUpdating ? "Updating..." : "Mark Completed"}
                          </button>
                        )}
                      </div>
                    </div>
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

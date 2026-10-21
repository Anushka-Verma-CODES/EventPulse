
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../../components/volunteer/StatusBadge";
import {
  getMyVolunteerAssignments,
} from "../../features/volunteers/api/volunteersApi";
import type {
  VolunteerAssignment,
} from "../../features/volunteers/api/volunteersApi";

function formatDate(dateString?: string | null): string {
  if (!dateString) return "Date unavailable";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function getStatusLabel(status: VolunteerAssignment["status"]): string {
  switch (status) {
    case "assigned":
      return "Assigned";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return "Cancelled";
  }
}

export default function ShiftDetail() {
  const { shiftId } = useParams();
  const [assignment, setAssignment] =
    useState<VolunteerAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignment() {
      try {
        const assignments = await getMyVolunteerAssignments();
        const selectedAssignment = assignments.find(
          (item) => item.id === shiftId,
        );

        if (isMounted) {
          setAssignment(selectedAssignment ?? null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load assignment details.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAssignment();

    return () => {
      isMounted = false;
    };
  }, [shiftId]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 text-sm text-[#64748B]">
        Loading assignment details...
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {error}
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1E293B]">
          Assignment not found
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          This assignment may no longer exist or may not belong to your account.
        </p>
        <Link
          to="/volunteer/shifts"
          className="mt-4 inline-block text-sm font-medium text-[#2563EB] hover:underline"
        >
          Back to My Shifts
        </Link>
      </div>
    );
  }

  const event = assignment.event;

  return (
    <div>
      <Link
        to="/volunteer/shifts"
        className="text-sm font-medium text-[#2563EB] hover:underline"
      >
        &larr; Back to My Shifts
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            {event?.title ?? "Event"}
          </h2>
          <p className="mt-1 text-base font-medium text-[#1E293B]">
            {assignment.assignedRole}
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            {formatDate(event?.startDate)}
          </p>
        </div>

        <StatusBadge status={getStatusLabel(assignment.status)} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-xs text-[#64748B]">Location</div>
          <div className="mt-1 text-sm font-medium text-[#1E293B]">
            {event?.location || "Location unavailable"}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-xs text-[#64748B]">Event End Date</div>
          <div className="mt-1 text-sm font-medium text-[#1E293B]">
            {formatDate(event?.endDate)}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-xs text-[#64748B]">Hours Worked</div>
          <div className="mt-1 text-sm font-medium text-[#1E293B]">
            {assignment.hoursWorked ?? "0"}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-xs text-[#64748B]">Assignment Created</div>
          <div className="mt-1 text-sm font-medium text-[#1E293B]">
            {formatDate(assignment.createdAt)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1E293B]">
          Assignment Information
        </h3>
        <p className="mt-2 text-sm text-[#64748B]">
          Your assigned responsibility is{" "}
          <span className="font-medium text-[#1E293B]">
            {assignment.assignedRole}
          </span>
          . Check your task page to update the assignment status and record
          completed hours.
        </p>

        <Link
          to="/volunteer/tasks"
          className="mt-4 inline-block rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          Go to My Tasks
        </Link>
      </div>

      <p className="mt-4 text-xs text-[#64748B]">
        Dedicated shift schedules and check-in/check-out records are not
        available through the current backend API.
      </p>
    </div>
  );
}


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/volunteer/StatusBadge";
import {
  getMyVolunteerAssignments,
} from "../../features/volunteers/api/volunteersApi";
import type {
  VolunteerAssignment,
} from "../../features/volunteers/api/volunteersApi";

const filters = ["Upcoming", "Today", "Completed"];

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

export default function MyShifts() {
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [activeFilter, setActiveFilter] = useState("Upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const visibleAssignments = assignments.filter((assignment) => {
    if (assignment.status === "cancelled") {
      return false;
    }

    if (activeFilter === "Completed") {
      return assignment.status === "completed";
    }

    if (assignment.status === "completed") {
      return false;
    }

    if (!assignment.event?.startDate) {
      return activeFilter === "Upcoming";
    }

    const eventDate = new Date(assignment.event.startDate);

    if (Number.isNaN(eventDate.getTime())) {
      return activeFilter === "Upcoming";
    }

    if (activeFilter === "Today") {
      return eventDate >= todayStart && eventDate < tomorrowStart;
    }

    return eventDate >= tomorrowStart;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">My Shifts</h2>
      <p className="mt-1 text-sm text-[#64748B]">
        View your assigned event duties and completed volunteer work.
        Specific shift times are not available in the current assignment data.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
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
        <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-white p-5 text-sm text-[#64748B]">
          Loading your assignments...
        </div>
      ) : visibleAssignments.length === 0 ? (
        <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B]">
          {assignments.length === 0
            ? "You don't have any assignments yet. Organizer assignments will appear here."
            : `No ${activeFilter.toLowerCase()} assignments found.`}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {visibleAssignments.map((assignment) => {
            const event = assignment.event;

            return (
              <div
                key={assignment.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-[#1E293B]">
                      {event?.title ?? "Event"}
                    </h3>
                    <div className="text-sm text-[#64748B]">
                      {assignment.assignedRole}
                    </div>
                  </div>

                  <StatusBadge status={getStatusLabel(assignment.status)} />
                </div>

                <div className="mt-3 flex flex-col gap-1 text-xs text-[#64748B]">
                  <span>
                    &#128197; {formatDate(event?.startDate)}
                  </span>
                  <span>
                    &#128205; {event?.location ?? "Location unavailable"}
                  </span>
                  {event?.endDate && (
                    <span>
                      Event ends: {formatDate(event.endDate)}
                    </span>
                  )}
                </div>

                {assignment.status === "completed" && (
                  <p className="mt-3 text-xs text-[#64748B]">
                    Hours worked: {assignment.hoursWorked ?? 0}
                  </p>
                )}

                <Link
                  to="/volunteer/tasks"
                  className="mt-4 inline-block rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
                >
                  View Task
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

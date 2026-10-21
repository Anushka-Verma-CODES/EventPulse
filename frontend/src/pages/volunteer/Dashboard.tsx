
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/volunteer/StatCard";
import StatusBadge from "../../components/volunteer/StatusBadge";
import DashboardBackdrop from "../../components/ui/DashboardBackdrop";
import { getMyProfile } from "../../lib/authApi";
import {
  getMyVolunteerActivity,
  getMyVolunteerAssignments,
} from "../../features/volunteers/api/volunteersApi";
import type {
  VolunteerActivityStats,
  VolunteerAssignment,
} from "../../features/volunteers/api/volunteersApi";
import { getAuthHeaders } from "../../lib/authApi";

const API_BASE_URL = "http://localhost:3000";

type ApplicationStatus = "pending" | "accepted" | "rejected";

interface VolunteerApplication {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    startDate: string;
    location: string;
  };
}

interface DashboardActivity {
  id: string;
  text: string;
  context: string;
  date: string;
  timestamp: number;
}

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

function getAssignmentStatus(status: VolunteerAssignment["status"]): string {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Assigned";
  }
}

function getApplicationStatus(status: ApplicationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function VolunteerDashboard() {
  const [volunteerName, setVolunteerName] = useState("Volunteer");
  const [activityStats, setActivityStats] =
    useState<VolunteerActivityStats | null>(null);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const [profile, stats, assignmentData, applicationResponse] =
          await Promise.all([
            getMyProfile(),
            getMyVolunteerActivity(),
            getMyVolunteerAssignments(),
            fetch(`${API_BASE_URL}/volunteers/me/applications`, {
              headers: getAuthHeaders(),
            }),
          ]);

        if (!applicationResponse.ok) {
          const responseData = await applicationResponse
            .json()
            .catch(() => null);

          const message = responseData?.message;

          throw new Error(
            Array.isArray(message)
              ? message.join(", ")
              : message || "Unable to load volunteer applications.",
          );
        }

        const applicationData: VolunteerApplication[] =
          await applicationResponse.json();

        if (!isMounted) return;

        setVolunteerName(profile.fullName || "Volunteer");
        setActivityStats(stats);
        setAssignments(assignmentData);
        setApplications(applicationData);
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your volunteer dashboard.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const activeAssignments = assignments.filter(
    (assignment) =>
      assignment.status === "assigned" ||
      assignment.status === "in_progress",
  );

  const upcomingAssignments = activeAssignments
    .filter((assignment) => {
      if (!assignment.event?.startDate) return false;

      const eventDate = new Date(assignment.event.startDate);

      return (
        !Number.isNaN(eventDate.getTime()) &&
        eventDate >= today
      );
    })
    .sort(
      (a, b) =>
        new Date(a.event.startDate).getTime() -
        new Date(b.event.startDate).getTime(),
    );

  const nextAssignment = upcomingAssignments[0];

  const dashboardStats = [
    {
      label: "Active Assignments",
      value: String(activityStats?.activeAssignments ?? 0),
    },
    {
      label: "Upcoming Assignments",
      value: String(upcomingAssignments.length),
    },
    {
      label: "Hours Completed",
      value: String(activityStats?.totalVolunteerHours ?? 0),
    },
    {
      label: "Applications",
      value: String(applications.length),
    },
  ];

  const myEvents = [...assignments]
    .filter((assignment) => assignment.status !== "cancelled")
    .sort((a, b) => {
      const dateA = a.event?.startDate
        ? new Date(a.event.startDate).getTime()
        : 0;
      const dateB = b.event?.startDate
        ? new Date(b.event.startDate).getTime()
        : 0;

      return dateB - dateA;
    })
    .slice(0, 4);

  const recentActivity: DashboardActivity[] = [
    ...assignments.map((assignment) => {
      const statusText = getAssignmentStatus(assignment.status);

      return {
        id: `assignment-${assignment.id}`,
        text:
          assignment.status === "completed"
            ? "Assignment completed"
            : assignment.status === "in_progress"
              ? "Assignment started"
              : assignment.status === "cancelled"
                ? "Assignment cancelled"
                : "New assignment received",
        context: `${assignment.event?.title ?? "Event"} — ${assignment.assignedRole}`,
        date: formatDate(
          assignment.completedAt ||
            assignment.updatedAt ||
            assignment.createdAt,
        ),
        timestamp: new Date(
          assignment.completedAt ||
            assignment.updatedAt ||
            assignment.createdAt,
        ).getTime(),
      };
    }),
    ...applications.map((application) => ({
      id: `application-${application.id}`,
      text: `Application ${getApplicationStatus(application.status).toLowerCase()}`,
      context: application.event?.title ?? "Volunteer opportunity",
      date: formatDate(application.createdAt),
      timestamp: new Date(application.createdAt).getTime(),
    })),
  ]
    .filter((item) => Number.isFinite(item.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="relative isolate -m-6 min-h-[calc(100vh-3rem)] overflow-hidden p-6 sm:-m-8 sm:p-8">
      <DashboardBackdrop />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">
              Welcome back, {volunteerName.split(" ")[0]}!
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Here&apos;s what&apos;s happening with your volunteer activities.
            </p>
          </div>

          <Link
            to="/volunteer/opportunities"
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
          >
            Browse Opportunities
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={isLoading ? "—" : stat.value}
            />
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[#1E293B]">
              Next Assignment
            </h3>

            {nextAssignment && (
              <StatusBadge
                status={getAssignmentStatus(nextAssignment.status)}
              />
            )}
          </div>

          {isLoading ? (
            <p className="text-sm text-[#64748B]">
              Loading your assignments...
            </p>
          ) : nextAssignment ? (
            <>
              <div className="text-base font-medium text-[#1E293B]">
                {nextAssignment.event?.title ?? "Event"}
              </div>

              <div className="mt-1 text-sm text-[#64748B]">
                {nextAssignment.assignedRole} &bull;{" "}
                {nextAssignment.event?.location ?? "Location unavailable"}
              </div>

              <div className="mt-1 text-sm text-[#64748B]">
                Event date: {formatDate(nextAssignment.event?.startDate)}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#64748B]">
              You have no upcoming assignments yet. Check your applications
              or browse opportunities to get started.
            </p>
          )}

          <Link
            to="/volunteer/tasks"
            className="mt-3 inline-block rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            View My Tasks
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
            <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">
              My Events
            </h3>

            {isLoading ? (
              <p className="py-3 text-sm text-[#64748B]">
                Loading your events...
              </p>
            ) : myEvents.length === 0 ? (
              <p className="py-3 text-sm text-[#64748B]">
                No event assignments yet.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-[#E2E8F0]">
                {myEvents.map((assignment) => (
                  <div key={assignment.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[#1E293B]">
                        {assignment.event?.title ?? "Event"}
                      </span>

                      <StatusBadge
                        status={getAssignmentStatus(assignment.status)}
                      />
                    </div>

                    <div className="mt-1 text-xs text-[#64748B]">
                      {assignment.assignedRole}
                    </div>

                    <div className="text-xs text-[#64748B]">
                      {formatDate(assignment.event?.startDate)}
                      {assignment.event?.location
                        ? ` • ${assignment.event.location}`
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/volunteer/tasks"
              className="mt-3 inline-block text-xs font-medium text-[#2563EB] hover:underline"
            >
              View all tasks
            </Link>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:border-[#BFDBFE] hover:shadow-md">
            <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">
              Recent Activity
            </h3>

            {isLoading ? (
              <p className="py-3 text-sm text-[#64748B]">
                Loading recent activity...
              </p>
            ) : recentActivity.length === 0 ? (
              <p className="py-3 text-sm text-[#64748B]">
                Your application and assignment activity will appear here.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[#E2E8F0]">
                {recentActivity.map((item) => (
                  <li key={item.id} className="py-2.5">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-[#16A34A]">
                        &#10003;
                      </span>

                      <span className="text-[#1E293B]">{item.text}</span>
                    </div>

                    <div className="pl-5 text-xs text-[#64748B]">
                      {item.context} &middot; {item.date}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Link
              to="/volunteer/applications"
              className="mt-3 inline-block text-xs font-medium text-[#2563EB] hover:underline"
            >
              View applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

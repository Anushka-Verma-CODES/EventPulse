
import { useEffect, useState } from "react";
import { getAuthHeaders } from "../../lib/authApi";
import StatusBadge from "../../components/volunteer/StatusBadge";

const API_BASE_URL = "http://localhost:3000";
const filters = ["All", "Pending", "Accepted", "Rejected"];

type ApplicationStatus = "pending" | "accepted" | "rejected";

interface VolunteerApplication {
  id: string;
  eventId: string;
  reason: string;
  availability: string[];
  status: ApplicationStatus;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string;
  };
}

export default function MyApplications() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function fetchApplications() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/volunteers/me/applications`,
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
              : message || "Failed to load your applications.",
          );
        }

        const data: VolunteerApplication[] = await response.json();

        if (isActive) {
          setApplications(data);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading applications.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchApplications();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredApplications =
    activeFilter === "All"
      ? applications
      : applications.filter(
          (application) =>
            application.status.toLowerCase() === activeFilter.toLowerCase(),
        );

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getRole(application: VolunteerApplication) {
    return "Volunteer";
  }

  function getStatusLabel(status: ApplicationStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">
        My Applications
      </h2>

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

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Applied On</th>
              <th className="px-4 py-3 font-medium">Shift</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-[#64748B]"
                >
                  Loading your applications...
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-[#64748B]"
                >
                  {error
                    ? "Applications could not be loaded."
                    : activeFilter === "All"
                      ? "You haven't applied to any events yet."
                      : `No ${activeFilter.toLowerCase()} applications found.`}
                </td>
              </tr>
            ) : (
              filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td className="px-4 py-3 font-medium text-[#1E293B]">
                    {application.event?.title ?? "Unknown event"}
                  </td>

                  <td className="px-4 py-3 text-[#64748B]">
                    {getRole(application)}
                  </td>

                  <td className="px-4 py-3 text-[#64748B]">
                    {formatDate(application.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-[#64748B]">
                    {application.availability?.length
                      ? application.availability.join(", ")
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={getStatusLabel(application.status)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

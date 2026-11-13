
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import StatGrid from "./StatGrid";
import { getAuthHeaders } from "../../lib/authApi";
import { API_BASE_URL } from "../../lib/apiConfig";

interface OrganizerDashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
}

interface OrganizerVolunteerStats {
  totalVolunteers: number;
}

interface OrganizerStat {
  label: string;
  value: string;
}

export default function OrganizerSection() {
  const [stats, setStats] = useState<OrganizerStat[]>([
    { label: "Events Created", value: "0" },
    { label: "Upcoming Events", value: "0" },
    { label: "Registrations", value: "0" },
    { label: "Volunteers Managed", value: "0" },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const headers = getAuthHeaders();

      const [dashboardResponse, volunteerResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/registrations/organizer/dashboard-stats`,
            { headers }
          ),
          fetch(
            `${API_BASE_URL}/volunteers/organizer/overview`,
            { headers }
          ),
        ]);

      if (!dashboardResponse.ok || !volunteerResponse.ok) {
        throw new Error("Unable to load organizer activity statistics.");
      }

      const [dashboard, volunteers]: [
        OrganizerDashboardStats,
        OrganizerVolunteerStats
      ] = await Promise.all([
        dashboardResponse.json(),
        volunteerResponse.json(),
      ]);

      setStats([
        {
          label: "Events Created",
          value: dashboard.totalEvents.toLocaleString("en-IN"),
        },
        {
          label: "Upcoming Events",
          value: dashboard.upcomingEvents.toLocaleString("en-IN"),
        },
        {
          label: "Registrations",
          value: dashboard.totalRegistrations.toLocaleString("en-IN"),
        },
        {
          label: "Volunteers Managed",
          value: volunteers.totalVolunteers.toLocaleString("en-IN"),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load organizer activity statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#1E293B]">
            Organizer Activity
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Your actual event and volunteer statistics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={loading}
          title="Refresh statistics"
          aria-label="Refresh organizer statistics"
          className="rounded-lg border border-[#E2E8F0] p-2 text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
          <button
            type="button"
            onClick={() => void loadStats()}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && stats.every((stat) => stat.value === "0") ? (
        <p className="py-6 text-center text-sm text-[#64748B]">
          Loading organizer statistics...
        </p>
      ) : (
        <StatGrid stats={stats} />
      )}
    </div>
  );
}

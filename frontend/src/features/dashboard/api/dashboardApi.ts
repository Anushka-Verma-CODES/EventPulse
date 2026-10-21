
import { getAuthHeaders } from "../../../lib/authApi";

const API_BASE_URL = "http://localhost:3000";

export interface OrganizerDashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  totalCheckIns: number;
  upcomingEventsList: {
    id: string;
    name: string;
    date: string;
    venue: string;
    registered: number;
  }[];
  weeklyAttendance: {
    day: string;
    value: number;
  }[];
  recentActivity: {
    id: string;
    text: string;
    context: string;
    date: string | null;
  }[];
}

export async function getOrganizerDashboardStats(): Promise<OrganizerDashboardStats> {
  const response = await fetch(
    `${API_BASE_URL}/registrations/organizer/dashboard-stats`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(
      message || `Failed to load dashboard (${response.status})`,
    );
  }

  return response.json() as Promise<OrganizerDashboardStats>;
}

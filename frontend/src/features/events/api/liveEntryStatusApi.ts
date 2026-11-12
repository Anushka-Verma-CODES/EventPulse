
import { API_BASE_URL } from "../../../lib/apiConfig";

export interface LiveGateStatus {
  gateId: string;
  gateName: string;
  gateCode: string;
  entries: number;
  scansPerMinute: number;
  trafficLevel: "Normal" | "Moderate" | "High" | "Very High";
}

export interface LiveEntryStatusData {
  eventId: string;
  eventName: string;
  monitoringWindowMinutes: number;
  generatedAt: string;
  totalEntries: number;
  recommendedGate: {
    gateId: string;
    gateName: string;
  } | null;
  gates: LiveGateStatus[];
}

export async function getLiveEntryStatus(
  eventId: string,
): Promise<LiveEntryStatusData> {
  const response = await fetch(
    `${API_BASE_URL}/events/${eventId}/live-entry-status`,
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message || "Unable to load live entry status.",
    );
  }

  return response.json() as Promise<LiveEntryStatusData>;
}

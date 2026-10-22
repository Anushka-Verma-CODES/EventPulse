
import { getAuthHeaders } from "../../../lib/authApi";

const API_BASE_URL = "http://localhost:3000";

export type CheckInResponse = {
  message: string;
  registrationId: string;
  eventId: string;
  eventName: string;
  checkedInAt: string;
};

export async function checkInTicket(
  qrToken: string,
  eventId: string,
): Promise<CheckInResponse> {
  const response = await fetch(`${API_BASE_URL}/registrations/check-in`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ qrToken, eventId }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message;

    throw new Error(message || `Check-in failed (${response.status})`);
  }

  return data as CheckInResponse;
}

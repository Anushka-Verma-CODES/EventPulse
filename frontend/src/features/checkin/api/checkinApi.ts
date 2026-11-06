import { getAuthHeaders } from "../../../lib/authApi";

const API_BASE_URL = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '172.16.78.105'
  ? 'http://localhost:3000'
  : 'https://eventpulse-toa3.onrender.com';

export default API_BASE_URL;

export type CheckInResponse = {
  message: string;
  registrationId: string;
  ticketId: string;
  eventId: string;
  eventName: string;
  checkedInAt: string;
};

export type ScanHistoryEntry = {
  id: string;
  registrationId: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  eventName: string;
  ticketId: string;
  checkedInAt: string;
  result: "valid";
};

async function getErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  const message = Array.isArray(data?.message)
    ? data.message.join(", ")
    : data?.message;

  return message || `Request failed (${response.status})`;
}

export async function checkInTicket(
  ticketCode: string,
  eventId: string,
): Promise<CheckInResponse> {
  const response = await fetch(`${API_BASE_URL}/registrations/check-in`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      /^EP-[A-F0-9]{8}$/i.test(ticketCode.trim())
        ? { ticketId: ticketCode.trim().toUpperCase(), eventId }
        : { qrToken: ticketCode.trim(), eventId },
    ),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as CheckInResponse;
}

export async function getScannerScanHistory(): Promise<ScanHistoryEntry[]> {
  const response = await fetch(
    `${API_BASE_URL}/registrations/scanner/scan-history`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as ScanHistoryEntry[];
}

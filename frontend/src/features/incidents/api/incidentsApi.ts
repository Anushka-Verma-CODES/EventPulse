import { getAuthHeaders } from "../../../lib/authApi";

const VITE_API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : window.location.hostname === "172.16.78.105"
      ? "http://172.16.78.105:3000"
      : "https://eventpulse-toa3.onrender.com";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type IncidentStatus =
  | "open"
  | "in_progress"
  | "resolved";

export interface IncidentEvent {
  id: string;
  title: string;
}

export interface IncidentReporter {
  id: string;
  fullName: string;
  email: string;
}

export interface Incident {
  id: string;
  eventId: string;
  organizerId: string;
  reportedById: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event?: IncidentEvent;
  reportedBy?: IncidentReporter;
}

export interface CreateIncidentInput {
  eventId: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  location?: string;
}

export interface UpdateIncidentInput {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  location?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${VITE_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getIncidents(eventId?: string): Promise<Incident[]> {
  const query = eventId
    ? `?eventId=${encodeURIComponent(eventId)}`
    : "";

  return request<Incident[]>(`/incidents${query}`);
}

export function getMyIncidentReports(): Promise<Incident[]> {
  return request<Incident[]>("/incidents/my-reports");
}

export function createIncident(
  input: CreateIncidentInput,
): Promise<Incident> {
  return request<Incident>("/incidents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateIncident(
  incidentId: string,
  input: UpdateIncidentInput,
): Promise<Incident> {
  return request<Incident>(`/incidents/${incidentId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteIncident(
  incidentId: string,
): Promise<{ message: string }> {
  return request<{ message: string }>(`/incidents/${incidentId}`, {
    method: "DELETE",
  });
}
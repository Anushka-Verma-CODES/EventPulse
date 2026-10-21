import { getAuthHeaders } from "../../../lib/authApi";

const API_BASE_URL = "http://localhost:3000";

export interface VolunteerProfile {
  id: string;
  userId: string;
  skills: string[];
  preferredRoles: string[];
  availability: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateVolunteerProfileInput {
  skills?: string[];
  preferredRoles?: string[];
  availability?: string[];
}

export interface VolunteerActivityStats {
  eventsCompleted: number;
  totalVolunteerHours: number;
  activeAssignments: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message ?? "Failed to process volunteer profile request.",
    );
  }

  return response.json() as Promise<T>;
}

export async function getMyVolunteerProfile(): Promise<VolunteerProfile> {
  const response = await fetch(`${API_BASE_URL}/volunteers/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<VolunteerProfile>(response);
}

export async function updateMyVolunteerProfile(
  input: UpdateVolunteerProfileInput,
): Promise<VolunteerProfile> {
  const response = await fetch(`${API_BASE_URL}/volunteers/me`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<VolunteerProfile>(response);
}

export async function getMyVolunteerActivity(): Promise<VolunteerActivityStats> {
  const response = await fetch(`${API_BASE_URL}/volunteers/me/activity`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<VolunteerActivityStats>(response);
}


export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  eventId: string;
  assignedRole: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  hoursWorked: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  volunteer?: {
    id: string;
    fullName?: string;
    email?: string;
  };
}

export interface CreateVolunteerAssignmentInput {
  volunteerId: string;
  eventId: string;
  assignedRole: string;
}

export interface UpdateVolunteerAssignmentInput {
  status: "in_progress" | "completed";
  hoursWorked?: number;
}

export async function getMyVolunteerAssignments(): Promise<VolunteerAssignment[]> {
  const response = await fetch(`${API_BASE_URL}/volunteers/me/assignments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<VolunteerAssignment[]>(response);
}

export async function createVolunteerAssignment(
  input: CreateVolunteerAssignmentInput,
): Promise<VolunteerAssignment> {
  const response = await fetch(`${API_BASE_URL}/volunteers/assignments`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleResponse<VolunteerAssignment>(response);
}

export async function updateMyVolunteerAssignment(
  assignmentId: string,
  input: UpdateVolunteerAssignmentInput,
): Promise<VolunteerAssignment> {
  const response = await fetch(
    `${API_BASE_URL}/volunteers/me/assignments/${assignmentId}`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  return handleResponse<VolunteerAssignment>(response);
}

export interface EligibleVolunteer {
  id: string;
  fullName: string;
  email: string;
}

export async function getEligibleVolunteers(): Promise<EligibleVolunteer[]> {
  const response = await fetch(
    `${API_BASE_URL}/volunteers/eligible-volunteers`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  return handleResponse<EligibleVolunteer[]>(response);
}

export async function getOrganizerVolunteerAssignments(): Promise<VolunteerAssignment[]> {
  const response = await fetch(
    `${API_BASE_URL}/volunteers/organizer/assignments`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  return handleResponse<VolunteerAssignment[]>(response);
}
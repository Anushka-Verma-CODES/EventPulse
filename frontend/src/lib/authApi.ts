
import { AuthError } from "../types/auth";
import type {
  AuthUser,
  LoginCredentials,
  RegisterPayload,
  UserRole,
} from "../types/auth";

const API_BASE_URL = "http://localhost:3000";

type BackendUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  roles: string[];
};

type LoginResponse = {
  message: string;
  accessToken: string;
  user: BackendUser;
};

type ProfileResponse = BackendUser;

function mapUser(user: BackendUser): AuthUser {
  const roleMap: Record<string, UserRole> = {
    attendee: "attendee",
    organizer: "organizer",
    volunteer: "volunteer",
    scanner_staff: "scanner",
    scanner: "scanner",
  };

  const roles = [
    ...new Set(
      user.roles
        .map((role) => roleMap[role])
        .filter((role): role is UserRole => role !== undefined)
    ),
  ];

  if (roles.length === 0) {
    throw new AuthError(
      "server_error",
      "No valid role is assigned to this account."
    );
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? null,
    roles,
  };
}

export function getAuthHeaders(): HeadersInit {
  const token = sessionStorage.getItem("eventpulse_access_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function loginRequest(
  credentials: LoginCredentials
): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new AuthError(
      "network_error",
      "Unable to connect to EventPulse. Please check your connection."
    );
  }

  if (response.status === 401) {
    throw new AuthError(
      "invalid_credentials",
      "Invalid email or password."
    );
  }

  if (!response.ok) {
    throw new AuthError(
      "server_error",
      "Something went wrong. Please try again."
    );
  }

  try {
    const data: LoginResponse = await response.json();
    const user = mapUser(data.user);

    sessionStorage.setItem(
      "eventpulse_access_token",
      data.accessToken
    );

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError(
      "server_error",
      "Invalid server response."
    );
  }
}

export async function registerRequest(
  payload: RegisterPayload
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthError(
      "network_error",
      "Unable to connect to EventPulse. Please check your connection."
    );
  }

  if (response.status === 409) {
    throw new AuthError(
      "email_exists",
      "An account with this email already exists."
    );
  }

  if (!response.ok) {
    throw new AuthError(
      "server_error",
      "Something went wrong. Please try again."
    );
  }
}

export async function getMyProfile(): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
    ...getAuthHeaders(),
    "Cache-Control": "no-cache",
    },
    cache: "no-store",
    });
  } catch {
    throw new AuthError(
      "network_error",
      "Unable to connect to EventPulse. Please check your connection."
    );
  }

  if (response.status === 401) {
    sessionStorage.removeItem("eventpulse_access_token");

    throw new AuthError(
      "invalid_credentials",
      "Your session is invalid or expired. Please log in again."
    );
  }

  if (!response.ok) {
    throw new AuthError(
      "server_error",
      "Unable to fetch your profile."
    );
  }

  try {
    const data: ProfileResponse = await response.json();
    return mapUser(data);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError(
      "server_error",
      "Invalid server response."
    );
  }
}

export async function activateRoleRequest(
  role: "organizer" | "volunteer" | "scanner"
): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/activate-role`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  role: role === "scanner" ? "scanner_staff" : role,
}),
    });
  } catch {
    throw new AuthError(
      "network_error",
      "Unable to connect to EventPulse. Please check your connection."
    );
  }

  if (!response.ok) {
    throw new AuthError(
      "server_error",
      "Unable to activate this role. Please try again."
    );
  }

  try {
    const data: ProfileResponse = await response.json();
    return mapUser(data);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError(
      "server_error",
      "Invalid server response."
    );
  }
}


export async function updateMyProfile(payload: {
  fullName: string;
  email: string;
  phone: string;
}): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthError(
      "network_error",
      "Unable to connect to EventPulse. Please check your connection."
    );
  }

  if (response.status === 401) {
    throw new AuthError(
      "invalid_credentials",
      "Your session is invalid or expired. Please log in again."
    );
  }

  if (response.status === 409) {
    throw new AuthError(
      "email_exists",
      "This email address is already in use."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = Array.isArray(errorData?.message)
      ? errorData.message.join(", ")
      : errorData?.message;

    throw new AuthError(
      "server_error",
      message || "Unable to update your profile."
    );
  }

  try {
    const data: ProfileResponse = await response.json();
    return mapUser(data);
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError(
      "server_error",
      "Invalid server response."
    );
  }
}


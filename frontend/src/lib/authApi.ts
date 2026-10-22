
const API_BASE_URL = "http://localhost:3000";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  roles: ("attendee" | "organizer" | "volunteer" | "scanner")[];
};

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

type ActivateRoleResponse = BackendUser & {
  message: string;
  accessToken: string;
};

export class AuthError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

function mapUser(user: BackendUser): AuthUser {
  const roles: AuthUser["roles"] = [];

  for (const role of user.roles ?? []) {
    if (
      role === "attendee" ||
      role === "organizer" ||
      role === "volunteer"
    ) {
      if (!roles.includes(role)) {
        roles.push(role);
      }
    }

    if (
      role === "scanner_staff" ||
      role === "scanner"
    ) {
      if (!roles.includes("scanner")) {
        roles.push("scanner");
      }
    }
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    roles,
  };
}

export function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("eventpulse_access_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function registerRequest(payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<AuthUser> {
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new AuthError(
      "server_error",
      errorData?.message ??
        "Registration failed. Please check your details and try again."
    );
  }

  try {
    const data: LoginResponse = await response.json();

    if (!data.accessToken || !data.user) {
      throw new AuthError(
        "server_error",
        "Invalid registration response from the server."
      );
    }

    sessionStorage.setItem(
      "eventpulse_access_token",
      data.accessToken
    );

    return mapUser(data.user);
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

export async function loginRequest(payload: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new AuthError(
      "server_error",
      errorData?.message ??
        "Login failed. Please check your email and password."
    );
  }

  try {
    const data: LoginResponse = await response.json();

    if (!data.accessToken || !data.user) {
      throw new AuthError(
        "server_error",
        "Invalid login response from the server."
      );
    }

    sessionStorage.setItem(
      "eventpulse_access_token",
      data.accessToken
    );

    return mapUser(data.user);
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

export async function getCurrentUserRequest(): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
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
      "Unable to fetch your profile. Please log in again."
    );
  }

  try {
    const data: ProfileResponse = await response.json();
    return mapUser(data);
  } catch {
    throw new AuthError(
      "server_error",
      "Invalid profile response from the server."
    );
  }
}

export async function updateProfileRequest(payload: {
  fullName?: string;
  phone?: string;
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new AuthError(
      "server_error",
      errorData?.message ?? "Unable to update your profile."
    );
  }

  try {
    const data: ProfileResponse = await response.json();
    return mapUser(data);
  } catch {
    throw new AuthError(
      "server_error",
      "Invalid profile response from the server."
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
    const errorData = await response.json().catch(() => null);

    throw new AuthError(
      "server_error",
      errorData?.message ??
        "Unable to activate this role. Please try again."
    );
  }

  try {
    const data: ActivateRoleResponse = await response.json();

    if (!data.accessToken) {
      throw new AuthError(
        "server_error",
        "The server did not return an updated access token."
      );
    }

    // The backend returns the updated user fields at the top level.
    const user = mapUser(data);

    // Replace the old token with one containing the newly activated role.
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

export function logoutRequest(): void {
  sessionStorage.removeItem("eventpulse_access_token");
}


export const getMyProfile = getCurrentUserRequest;
export const updateMyProfile = updateProfileRequest;



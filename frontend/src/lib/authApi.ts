import { AuthError } from "../types/auth";
import type { AuthUser, LoginCredentials, RegisterPayload } from "../types/auth";

// Replace this with a real call to your NestJS backend, e.g.
// POST /auth/login. Keep the same error-mapping shape so LoginForm
// doesn't need to change when the real endpoint is wired up.
export async function loginRequest(credentials: LoginCredentials): Promise<AuthUser> {
  let response: Response;

  try {
    response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new AuthError(
      "network_error",
      "Unable to connect to EventPulse. Please check your internet connection."
    );
  }

  if (response.status === 401) {
    throw new AuthError("invalid_credentials", "Invalid email or password.");
  }

  if (!response.ok) {
    throw new AuthError("server_error", "Something went wrong. Please try again.");
  }

  const data = await response.json();
  return data.user as AuthUser;
}

// Replace this with a real call to your NestJS backend, e.g. POST /auth/register.
// Per the current design, this deliberately doesn't log the user in automatically —
// SignupForm shows a success panel and sends the user to /login themselves,
// since the actual backend/session flow isn't built yet.
export async function registerRequest(payload: RegisterPayload): Promise<void> {
  let response: Response;

  try {
    response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthError(
      "network_error",
      "Unable to connect to EventPulse. Please check your internet connection."
    );
  }

  if (response.status === 409) {
    throw new AuthError("email_exists", "An account with this email already exists.");
  }

  if (!response.ok) {
    throw new AuthError("server_error", "Something went wrong. Please try again.");
  }
}

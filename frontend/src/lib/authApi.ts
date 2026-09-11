import { AuthError } from "../types/auth";
import type { AuthUser, LoginCredentials } from "../types/auth";

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

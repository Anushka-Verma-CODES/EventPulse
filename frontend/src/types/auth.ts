export type UserRole = "attendee" | "organizer" | "volunteer" | "scanner";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export type AuthErrorType = "invalid_credentials" | "email_exists" | "server_error" | "network_error";

export class AuthError extends Error {
  type: AuthErrorType;

  constructor(type: AuthErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

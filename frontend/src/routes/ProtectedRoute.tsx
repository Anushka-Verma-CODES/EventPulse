import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
};

const backendRoleMap: Record<string, UserRole> = {
  attendee: "attendee",
  organizer: "organizer",
  volunteer: "volunteer",
  scanner_staff: "scanner",
  scanner: "scanner",
};

export default function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const { profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Checking your session...</div>;
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = profile.roles
    .map((role) => backendRoleMap[role])
    .filter((role): role is UserRole => role !== undefined);

  const hasAllowedRole = userRoles.some((role) =>
    allowedRoles.includes(role)
  );

  if (!hasAllowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

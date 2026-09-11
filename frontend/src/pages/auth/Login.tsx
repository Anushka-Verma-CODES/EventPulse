import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";
import { loginRequest } from "../../lib/authApi";
import type { AuthUser, UserRole } from "../../types/auth";

// The backend is the source of truth for role — the frontend only
// reads user.role from the authenticated response and routes on it.
// It never lets a client-side choice grant access.
const roleRoutes: Record<UserRole, string> = {
  attendee: "/attendee/dashboard",
  organizer: "/organizer/dashboard",
  volunteer: "/volunteer/dashboard",
  scanner: "/scanner",
};

export default function Login() {
  const navigate = useNavigate();

  function handleSuccess(user: AuthUser) {
    navigate(roleRoutes[user.role]);
  }

  return (
    <AuthLayout>
      <LoginForm onSubmit={loginRequest} onSuccess={handleSuccess} />
    </AuthLayout>
  );
}

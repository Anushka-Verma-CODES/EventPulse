
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";
import { loginRequest } from "../../lib/authApi";
import { useAuth } from "../../context/AuthContext";
import type { AuthUser, UserRole } from "../../types/auth";

const roleRoutes: Record<UserRole, string> = {
  attendee: "/attendee/dashboard",
  organizer: "/organizer/dashboard",
  volunteer: "/volunteer/dashboard",
  scanner: "/scanner",
};

export default function Login() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  async function handleSuccess(user: AuthUser) {
    try {
      await refreshProfile();

      const role = user.roles[0];

      if (!role || !roleRoutes[role]) {
        throw new Error("No valid role found for this user.");
      }

      navigate(roleRoutes[role], { replace: true });
    } catch (error) {
      console.error("Profile authentication failed:", error);
      alert("Could not verify your login. Please log in again.");
    }
  }

  return (
    <AuthLayout>
      <LoginForm
        onSubmit={loginRequest}
        onSuccess={handleSuccess}
      />
    </AuthLayout>
  );
}

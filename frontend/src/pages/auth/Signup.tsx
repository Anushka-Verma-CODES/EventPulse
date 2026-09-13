import AuthLayout from "../../components/auth/AuthLayout";
import SignupForm from "../../components/auth/SignupForm";
import { registerRequest } from "../../lib/authApi";

export default function Signup() {
  return (
    <AuthLayout>
      <SignupForm onSubmit={registerRequest} />
    </AuthLayout>
  );
}

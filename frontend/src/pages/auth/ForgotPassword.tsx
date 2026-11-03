
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { forgotPasswordRequest, AuthError } from "../../lib/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const message = await forgotPasswordRequest(email);
      setSuccess(message);
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-5">
        <div>
          <span className="text-xs font-semibold tracking-wide text-[#2563EB]">
            ACCOUNT RECOVERY
          </span>
          <h1 className="mt-1 text-2xl font-bold text-[#1E293B]">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Enter your registered email address. We will send you a link to
            reset your password.
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AuthInput
            id="email"
            label="Email address"
            type="email"
            placeholder="Enter your registered email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Button type="submit" isLoading={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center text-sm text-[#64748B]">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-medium text-[#2563EB] hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

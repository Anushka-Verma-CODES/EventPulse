import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { resetPasswordRequest, AuthError } from "../../lib/authApi";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("This password reset link is invalid or incomplete.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setError(
        "Password must contain an uppercase letter, a lowercase letter, and a number."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const message = await resetPasswordRequest(token, newPassword);
      setSuccess(message);
      setNewPassword("");
      setConfirmPassword("");
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
            Reset your password
          </h1>

          <p className="mt-2 text-sm text-[#64748B]">
            Enter your new password below.
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        {!success && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AuthInput
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter new password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />

            <AuthInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <p className="-mt-2 text-xs text-[#64748B]">
              Password must be at least 8 characters and include uppercase,
              lowercase, and numeric characters.
            </p>

            <Button type="submit" isLoading={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-[#64748B]">
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
import { FormEvent, useState } from "react";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { AuthError } from "../../types/auth";
import type { AuthUser, LoginCredentials } from "../../types/auth";

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<AuthUser>;
  onSuccess: (user: AuthUser) => void;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string) {
  if (!email.trim()) return "Please enter your email.";
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return "Please enter a valid email address.";
  return undefined;
}

export default function LoginForm({ onSubmit, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const emailError = validateEmail(email);
    const passwordError = password ? undefined : "Please enter your password.";

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const user = await onSubmit({ email, password });
      onSuccess(user);
    } catch (error) {
      if (error instanceof AuthError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-medium text-[#12173D]">Welcome back</h1>
        <p className="mt-1 text-sm text-[#6A6F9A]">Sign in to continue to EventPulse.</p>
      </div>

      {formError && <Alert tone="error">{formError}</Alert>}

      <AuthInput
        id="email"
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />

      <div>
        <PasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <a href="/forgot-password" className="mt-2 inline-block text-xs text-[#3A63D6] hover:underline">
          Forgot password?
        </a>
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-[#6A6F9A]">
        Don&apos;t have an account?{" "}
        <a href="/register" className="font-medium text-[#3A63D6] hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}

import { FormEvent, useState } from "react";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
import PasswordStrength from "./PasswordStrength";
import Checkbox from "../ui/Checkbox";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { AuthError } from "../../types/auth";
import type { RegisterPayload } from "../../types/auth";

interface SignupFormProps {
  onSubmit: (payload: RegisterPayload) => Promise<void>;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

function validateEmail(email: string) {
  if (!email.trim()) return "Email is required.";
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return "Please enter a valid email address.";
  return undefined;
}

function validatePhone(phone: string) {
  if (!phone.trim()) return "Phone number is required.";
  const digitsOnly = phone.replace(/[\s()-]/g, "");
  const pattern = /^\+?[0-9]{7,15}$/;
  if (!pattern.test(digitsOnly)) return "Please enter a valid phone number.";
  return undefined;
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const errors: FieldErrors = {
      fullName: fullName.trim() ? undefined : "Full name is required.",
      email: validateEmail(email),
      phone: validatePhone(phone),
      password: password.length >= 8 ? undefined : "Use at least 8 characters.",
      confirmPassword:
        confirmPassword === password ? undefined : "Passwords do not match.",
      terms: agreedToTerms ? undefined : "Please accept the Terms & Conditions to continue.",
    };

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({ fullName, email, phone, password });
      setIsRegistered(true);
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

  if (isRegistered) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1E293B]">Account created successfully!</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Your EventPulse account has been created. You can now log in to continue.
          </p>
        </div>
        <a href="/login" className="w-full">
          <Button type="button">Go to Login</Button>
        </a>
      </div>
    );
  }

  const emailExists = formError === "An account with this email already exists.";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <span className="text-xs font-semibold tracking-wide text-[#2563EB]">GET STARTED</span>
        <h1 className="mt-1 text-2xl font-bold text-[#1E293B]">Create your account</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Join EventPulse and make event management simpler.
        </p>
      </div>

      {formError && (
        <Alert tone="error">
          {formError}
          {emailExists && (
            <>
              {" "}
              <a href="/login" className="font-medium underline">
                Login instead
              </a>
            </>
          )}
        </Alert>
      )}

      <AuthInput
        id="fullName"
        label="Full Name"
        autoComplete="name"
        placeholder="Enter your full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={fieldErrors.fullName}
      />

      <AuthInput
        id="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />

      <AuthInput
        id="phone"
        label="Phone Number"
        type="tel"
        autoComplete="tel"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
      />

      <div>
        <PasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />
        <PasswordStrength password={password} />
      </div>

      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
      />

      <Checkbox
        id="terms"
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.target.checked)}
        error={fieldErrors.terms}
        label={
          <>
            I agree to the{" "}
            <a href="/terms" className="font-medium text-[#2563EB] hover:underline">
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-[#2563EB] hover:underline">
              Privacy Policy
            </a>
          </>
        }
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-[#64748B]">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-[#2563EB] hover:underline">
          Login
        </a>
      </p>
    </form>
  );
}

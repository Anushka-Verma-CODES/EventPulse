
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../../lib/authApi";

interface ApplyModalProps {
  eventId: string;
  eventName: string;
  role: string;
  onClose: () => void;
}

const API_BASE_URL = "http://localhost:3000";
const availabilityOptions = ["Morning", "Afternoon", "Evening"];

export default function ApplyModal({
  eventId,
  eventName,
  role,
  onClose,
}: ApplyModalProps) {
  const [reason, setReason] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [preferredRole, setPreferredRole] = useState<"Any Role" | "Scanner">(
    "Any Role",
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleAvailability(option: string) {
    setAvailability((previous) =>
      previous.includes(option)
        ? previous.filter((item) => item !== option)
        : [...previous, option],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Please explain why you want to volunteer.");
      return;
    }

    if (availability.length === 0) {
      setError("Please select at least one availability option.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/volunteers/applications`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          reason: reason.trim(),
          availability,
          preferredRole,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => null);
        const message = responseData?.message;

        throw new Error(
          Array.isArray(message)
            ? message.join(" ")
            : message || "Failed to submit your application.",
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-[#1E293B]">
              Application Submitted
            </h3>

            <p className="mt-2 text-sm text-[#64748B]">
              Your application has been sent to the event organizer.
            </p>

            <Link
              to="/volunteer/applications"
              className="mt-4 inline-block rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              View My Applications
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-bold text-[#1E293B]">
              Apply for Volunteer Position
            </h3>

            <p className="mt-1 text-sm text-[#64748B]">
              {eventName} &bull; {role}
            </p>

            <label
              htmlFor="volunteer-reason"
              className="mt-4 block text-sm font-medium text-[#1E293B]"
            >
              Why do you want to volunteer?
            </label>

            <textarea
              id="volunteer-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="I would like to help with..."
              required
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />

            <div className="mt-4">
              <label
                htmlFor="volunteer-preferred-role"
                className="block text-sm font-medium text-[#1E293B]"
              >
                Preferred Role
              </label>

              <select
                id="volunteer-preferred-role"
                value={preferredRole}
                onChange={(event) =>
                  setPreferredRole(event.target.value as "Any Role" | "Scanner")
                }
                className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              >
                <option value="Any Role">Any Role</option>
                <option value="Scanner">Scanner</option>
              </select>

              <p className="mt-1.5 text-xs text-[#64748B]">
                Choosing Scanner expresses your preference only. The organizer
                must separately grant event-specific scanner access and set its
                permitted dates and times.
              </p>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium text-[#1E293B]">
                Availability
              </div>

              <div className="mt-2 flex flex-col gap-2">
                {availabilityOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm text-[#1E293B]"
                  >
                    <input
                      type="checkbox"
                      checked={availability.includes(option)}
                      onChange={() => toggleAvailability(option)}
                      className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

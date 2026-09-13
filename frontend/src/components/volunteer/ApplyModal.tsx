import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

interface ApplyModalProps {
  eventName: string;
  role: string;
  onClose: () => void;
}

const availabilityOptions = ["Morning", "Afternoon", "Evening"];

export default function ApplyModal({ eventName, role, onClose }: ApplyModalProps) {
  const [reason, setReason] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleAvailability(option: string) {
    setAvailability((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // No backend yet — this just simulates a successful submission.
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1E293B]">Application Submitted</h3>
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
            <h3 className="text-lg font-bold text-[#1E293B]">Apply for Volunteer Position</h3>
            <p className="mt-1 text-sm text-[#64748B]">
              {eventName} &bull; {role}
            </p>

            <label className="mt-4 block text-sm font-medium text-[#1E293B]">
              Why do you want to volunteer?
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="I would like to help with..."
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />

            <div className="mt-4">
              <div className="text-sm font-medium text-[#1E293B]">Availability</div>
              <div className="mt-2 flex flex-col gap-2">
                {availabilityOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-[#1E293B]">
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

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              >
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/apiConfig";
import { getAuthHeaders } from "../../lib/authApi";

type ScannerAssignment = {
  id: string;
  scannerUserId: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  scanner?: {
    id: string;
    fullName?: string;
    email?: string;
  };
  gate?: {
    id: string;
    name: string;
  };
};

type ScannerAssignmentsPanelProps = {
  eventId: string;
};

export default function ScannerAssignmentsPanel({
  eventId,
}: ScannerAssignmentsPanelProps) {
  const [assignments, setAssignments] = useState<ScannerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssignments = useCallback(async () => {
    if (!eventId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/volunteers/organizer/events/${eventId}/scanners`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to fetch scanner assignments.");
      }

      const data = await response.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Scanner assignments error:", err);
      setError("Unable to load scanner assignments.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    setLoading(true);
    loadAssignments();

    const interval = setInterval(loadAssignments, 30000);

    return () => clearInterval(interval);
  }, [loadAssignments]);

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1E293B]">
            Scanner Assignments
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Volunteers currently assigned to event gates.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAssignments}
          disabled={loading}
          className="self-start rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-medium text-[#334155] hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-[#64748B]">
          Loading scanner assignments...
        </p>
      ) : error ? (
        <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : assignments.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-[#CBD5E1] p-6 text-center">
          <p className="text-sm font-medium text-[#334155]">
            No active scanner assignments
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Assign a volunteer to a gate to see them here.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {(assignment.scanner?.fullName || "S")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {assignment.scanner?.fullName || "Scanner volunteer"}
                  </p>

                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {assignment.scanner?.email || "Email unavailable"}
                  </p>

                  <p className="mt-2 text-xs text-[#64748B]">
                    Gate:{" "}
                    <span className="font-semibold text-[#334155]">
                      {assignment.gate?.name || "Gate unavailable"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Assignment Active
                </span>

                <p className="text-xs text-[#94A3B8]">
                  {assignment.startsAt
                    ? new Date(assignment.startsAt).toLocaleString()
                    : "Start time unavailable"}
                </p>

                <p className="text-xs text-[#94A3B8]">
                  Until:{" "}
                  {assignment.endsAt
                    ? new Date(assignment.endsAt).toLocaleString()
                    : "End time unavailable"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 border-t border-[#E2E8F0] pt-3 text-xs text-[#94A3B8]">
        Assignment status confirms access granted by the organizer. It does
        not indicate whether the scanner device is currently online.
      </p>
    </section>
  );
}

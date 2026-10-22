
import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getEventById } from "../../features/events/api/eventsApi";
import type { EventItem } from "../../types/event";

export default function GateSelector() {
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getEventById(eventId);

        if (!cancelled) {
          setEvent(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load event details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (!eventId) {
    return <Navigate to="/scanner" replace />;
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-[#64748B]">
          Loading event details...
        </p>
      </div>
    );
  }

  if (!event && !error) {
    return <Navigate to="/scanner" replace />;
  }

  return (
    <div>
      <Link
        to="/scanner"
        className="text-sm font-medium text-[#2563EB] hover:underline"
      >
        &larr; Back to events
      </Link>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {event && (
        <>
          <h2 className="mt-3 text-xl font-bold text-[#1E293B]">
            {event.name}
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            {event.date} &bull; {event.venue}
          </p>

          <h3 className="mt-6 text-sm font-semibold tracking-wide text-[#64748B]">
            SCANNING STATION
          </h3>

          <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#EFF6FF] p-3 text-[#2563EB]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <path d="M7 7h3v3H7z" />
                  <path d="M14 7h3v3h-3z" />
                  <path d="M7 14h3v3H7z" />
                  <path d="M14 14h3v3h-3z" />
                </svg>
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-[#1E293B]">
                  General Entry
                </h4>
                <p className="mt-1 text-sm text-[#64748B]">
                  Scan attendee QR codes for this event.
                </p>
                <p className="mt-2 text-xs text-[#64748B]">
                  Gate-specific tracking is not configured yet.
                </p>
              </div>
            </div>

            <Link
              to={`/scanner/event/${event.id}/gate/general-entry`}
              className="mt-5 inline-flex rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Start Scanning
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

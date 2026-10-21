
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyRegistrations,
} from "../../features/events/api/eventsApi";
import type {
  MyRegistration,
} from "../../features/events/api/eventsApi";
import {
  createIncident,
} from "../../features/incidents/api/incidentsApi";
import type {
  IncidentSeverity,
} from "../../features/incidents/api/incidentsApi";

type TicketItem = {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  venue: string;
  gate: string;
  ticketNumber: string;
  section: string;
  status: string;
  imageUrl: string;
};

export default function MyTickets() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reportTicket, setReportTicket] =
    useState<TicketItem | null>(null);
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentSeverity, setIncidentSeverity] =
    useState<IncidentSeverity>("medium");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTickets() {
      try {
        const registrations: MyRegistration[] =
          await getMyRegistrations();

        if (!isMounted) return;

        const mappedTickets = registrations.map(
          (registration, index) => {
            const event = registration.event;

            return {
              id: registration.id,
              eventId: registration.eventId,
              eventName: event.title,
              date: new Date(event.startDate).toLocaleString(
                "en-IN",
                {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                },
              ),
              venue: event.location,
              gate: "Main Entry",
              ticketNumber: `EP-${String(index + 1).padStart(4, "0")}`,
              section: event.category,
              status: "Registration Confirmed",
              imageUrl: event.bannerImage || "/event-hero.png",
            };
          },
        );

        setTickets(mappedTickets);
      } catch (err: unknown) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your registered events.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTickets();

    return () => {
      isMounted = false;
    };
  }, []);

  function openReportForm(ticket: TicketItem) {
    setReportTicket(ticket);
    setIncidentTitle("");
    setIncidentDescription("");
    setIncidentSeverity("medium");
    setIncidentLocation("");
    setReportError("");
    setReportSuccess("");
  }

  function closeReportForm() {
    if (submitting) return;

    setReportTicket(null);
    setReportError("");
    setReportSuccess("");
  }

  async function handleSubmitReport(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!reportTicket) return;

    setSubmitting(true);
    setReportError("");
    setReportSuccess("");

    try {
      await createIncident({
        eventId: reportTicket.eventId,
        title: incidentTitle.trim(),
        description: incidentDescription.trim(),
        severity: incidentSeverity,
        location: incidentLocation.trim() || undefined,
      });

      setReportSuccess(
        `Your incident report for "${reportTicket.eventName}" was submitted successfully.`,
      );

      setIncidentTitle("");
      setIncidentDescription("");
      setIncidentLocation("");
      setIncidentSeverity("medium");
    } catch (err: unknown) {
      setReportError(
        err instanceof Error
          ? err.message
          : "Unable to submit your incident report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">
          My Tickets
        </h2>
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-8 text-sm text-[#64748B] shadow-sm">
          Loading your registrations...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            My Tickets
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Your registered events and access details.
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-white p-6 text-sm text-red-600 shadow-sm"
        >
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#E2E8F0] bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-[#64748B]">
            You haven't registered for any events yet.
          </p>
          <Link
            to="/events"
            className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline"
          >
            Browse events →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="group rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition hover:border-[#93C5FD] hover:shadow-md"
            >
              <Link
                to={`/attendee/tickets/${ticket.id}`}
                className="block"
              >
                <div className="mb-4 aspect-[16/9] overflow-hidden rounded-lg bg-[#E2E8F0]">
                  <img
                    src={ticket.imageUrl}
                    alt={`${ticket.eventName} event`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
                    {ticket.section}
                  </p>
                  <span className="rounded-full bg-[#ECFDF5] px-2 py-1 text-[11px] font-medium text-[#166534]">
                    {ticket.status}
                  </span>
                </div>

                <h3 className="mt-3 truncate text-base font-bold text-[#1E293B]">
                  {ticket.eventName}
                </h3>

                <p className="mt-1 truncate text-sm text-[#64748B]">
                  {ticket.date}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs">
                  <span className="truncate text-[#64748B]">
                    {ticket.venue}
                  </span>
                  <span className="ml-3 shrink-0 font-semibold text-[#2563EB] group-hover:underline">
                    View details →
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => openReportForm(ticket)}
                className="mt-4 w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
              >
                Report Incident
              </button>
            </div>
          ))}
        </div>
      )}

      {reportTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReportForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-form-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="incident-form-title"
                  className="text-xl font-bold text-[#1E293B]"
                >
                  Report an Incident
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  Event: {reportTicket.eventName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReportForm}
                disabled={submitting}
                aria-label="Close incident form"
                className="rounded-lg px-2 py-1 text-xl text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {reportSuccess ? (
              <div className="mt-6">
                <div
                  role="status"
                  className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                  {reportSuccess}
                </div>

                <button
                  type="button"
                  onClick={closeReportForm}
                  className="mt-5 w-full rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitReport}
                className="mt-6 space-y-4"
              >
                {reportError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {reportError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="incident-title"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Incident title
                  </label>
                  <input
                    id="incident-title"
                    type="text"
                    value={incidentTitle}
                    onChange={(event) =>
                      setIncidentTitle(event.target.value)
                    }
                    maxLength={200}
                    required
                    placeholder="Briefly describe the issue"
                    className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="incident-description"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Description
                  </label>
                  <textarea
                    id="incident-description"
                    value={incidentDescription}
                    onChange={(event) =>
                      setIncidentDescription(event.target.value)
                    }
                    required
                    rows={4}
                    placeholder="Explain what happened..."
                    className="w-full resize-y rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="incident-severity"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Severity
                  </label>
                  <select
                    id="incident-severity"
                    value={incidentSeverity}
                    onChange={(event) =>
                      setIncidentSeverity(
                        event.target.value as IncidentSeverity,
                      )
                    }
                    className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="incident-location"
                    className="mb-1.5 block text-sm font-medium text-[#334155]"
                  >
                    Location <span className="font-normal text-[#64748B]">(optional)</span>
                  </label>
                  <input
                    id="incident-location"
                    type="text"
                    value={incidentLocation}
                    onChange={(event) =>
                      setIncidentLocation(event.target.value)
                    }
                    maxLength={150}
                    placeholder="e.g. Main entrance, Hall B"
                    className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeReportForm}
                    disabled={submitting}
                    className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

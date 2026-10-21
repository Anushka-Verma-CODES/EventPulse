
import { useCallback, useEffect, useState } from "react";
import {
  createIncident,
  deleteIncident,
  getIncidents,
  updateIncident,
  type Incident,
  type IncidentSeverity,
  type IncidentStatus,
} from "../../features/incidents/api/incidentsApi";
import { getMyEvents } from "../../features/events/api/eventsApi";

interface OrganizerEvent {
  id: string;
  title: string;
}

const filters = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
] as const;

const severityOptions: IncidentSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function displayLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function severityClass(severity: IncidentSeverity) {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function statusClass(status: IncidentStatus) {
  switch (status) {
    case "resolved":
      return "bg-emerald-100 text-emerald-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-rose-100 text-rose-800";
  }
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] =
    useState<IncidentSeverity>("medium");

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load incidents.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);

    try {
      const data = await getMyEvents();
      setEvents(data.map((event) => ({
        id: event.id,
        title: event.title,
      })));
    } catch (err) {
      setError(
        err instanceof Error
          ? `Unable to load your events: ${err.message}`
          : "Unable to load your events.",
      );
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIncidents();
    void loadEvents();
  }, [loadIncidents, loadEvents]);

  const filteredIncidents =
    activeFilter === "all"
      ? incidents
      : incidents.filter(
          (incident) => incident.status === activeFilter,
        );

  const resetForm = () => {
    setEventId("");
    setTitle("");
    setDescription("");
    setLocation("");
    setSeverity("medium");
  };

  const handleCreate = async (
    formEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    formEvent.preventDefault();
    setError("");
    setSuccess("");

    if (!eventId) {
      setError("Please select an event.");
      return;
    }

    setSubmitting(true);

    try {
      const created = await createIncident({
        eventId,
        title: title.trim(),
        description: description.trim(),
        severity,
        location: location.trim() || undefined,
      });

      setIncidents((current) => [created, ...current]);
      setShowForm(false);
      resetForm();
      setSuccess("Incident reported successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to report this incident.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    incident: Incident,
    status: IncidentStatus,
  ) => {
    if (incident.status === status) return;

    setError("");
    setSuccess("");
    setUpdatingId(incident.id);

    try {
      const updated = await updateIncident(incident.id, {
        status,
      });

      setIncidents((current) =>
        current.map((item) =>
          item.id === incident.id ? updated : item,
        ),
      );

      setSuccess("Incident status updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update incident status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (incident: Incident) => {
    const confirmed = window.confirm(
      `Delete the incident "${incident.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(incident.id);

    try {
      await deleteIncident(incident.id);

      setIncidents((current) =>
        current.filter((item) => item.id !== incident.id),
      );

      setSuccess("Incident deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this incident.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Incidents
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Report and track operational issues across your events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm((current) => !current);
          }}
          className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Report Incident"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="font-semibold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="font-semibold"
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-[#1E293B]">
            Report a new incident
          </h3>

          <div>
            <label
              htmlFor="incident-event"
              className="mb-1.5 block text-sm font-medium text-[#334155]"
            >
              Event
            </label>
            <select
              id="incident-event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
              disabled={eventsLoading || events.length === 0}
              className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                {eventsLoading
                  ? "Loading your events..."
                  : events.length === 0
                    ? "No events available"
                    : "Select an event"}
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="incident-title"
              className="mb-1.5 block text-sm font-medium text-[#334155]"
            >
              Incident title
            </label>
            <input
              id="incident-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="e.g. High crowd density at Gate 2"
              className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe what happened and any action required."
              className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="incident-location"
                className="mb-1.5 block text-sm font-medium text-[#334155]"
              >
                Location
              </label>
              <input
                id="incident-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={150}
                placeholder="e.g. Gate 2 or Main Hall"
                className="w-full rounded-lg border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as IncidentSeverity)
                }
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayLabel(option)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || eventsLoading || events.length === 0}
              className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Incident"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total Incidents",
            value: incidents.length,
          },
          {
            label: "Open",
            value: incidents.filter((item) => item.status === "open").length,
          },
          {
            label: "Resolved",
            value: incidents.filter((item) => item.status === "resolved").length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-[#64748B]">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-[#1E293B]">
              {loading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter.value
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#64748B] hover:bg-[#F8FAFC]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            void loadIncidents();
            void loadEvents();
          }}
          disabled={loading}
          className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#475569] hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center text-sm text-[#64748B]">
          Loading incidents...
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white px-5 py-12 text-center">
          <h3 className="font-semibold text-[#1E293B]">
            {incidents.length === 0
              ? "No incidents reported yet"
              : "No incidents match this filter"}
          </h3>
          <p className="mt-2 text-sm text-[#64748B]">
            {incidents.length === 0
              ? "Report an incident to start tracking operational issues."
              : "Choose another status to view your incidents."}
          </p>
          {incidents.length === 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Report your first incident
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredIncidents.map((incident) => (
            <article
              key={incident.id}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-[#1E293B]">
                  {incident.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${severityClass(incident.severity)}`}
                >
                  {displayLabel(incident.severity)}
                </span>
              </div>

              <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-[#64748B]">
                {incident.description}
              </p>

              <div className="space-y-2 border-t border-[#F1F5F9] pt-3 text-sm text-[#64748B]">
                <p>
                  <span className="font-medium text-[#475569]">Event:</span>{" "}
                  {incident.event?.title ??
                    events.find((event) => event.id === incident.eventId)
                      ?.title ??
                    "Event"}
                </p>
                <p>
                  <span className="font-medium text-[#475569]">Location:</span>{" "}
                  {incident.location || "Not specified"}
                </p>
                <p>
                  <span className="font-medium text-[#475569]">
                    Reported:
                  </span>{" "}
                  {formatDate(incident.createdAt)}
                </p>
                {incident.resolvedAt && (
                  <p>
                    <span className="font-medium text-[#475569]">
                      Resolved:
                    </span>{" "}
                    {formatDate(incident.resolvedAt)}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(incident.status)}`}
                >
                  {displayLabel(incident.status)}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="sr-only" htmlFor={`status-${incident.id}`}>
                    Update incident status
                  </label>
                  <select
                    id={`status-${incident.id}`}
                    value={incident.status}
                    disabled={
                      updatingId === incident.id ||
                      deletingId === incident.id
                    }
                    onChange={(e) =>
                      void handleStatusChange(
                        incident,
                        e.target.value as IncidentStatus,
                      )
                    }
                    className="max-w-36 rounded-lg border border-[#CBD5E1] bg-white px-2 py-1.5 text-xs text-[#334155] outline-none focus:border-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <button
                    type="button"
                    disabled={
                      updatingId === incident.id ||
                      deletingId === incident.id
                    }
                    onClick={() => void handleDelete(incident)}
                    className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {deletingId === incident.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

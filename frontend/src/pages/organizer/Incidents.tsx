
import { useCallback, useEffect, useMemo, useState } from "react";
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

type StatusFilter = "all" | IncidentStatus;

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

const severityOptions: IncidentSeverity[] = [
  "low",
  "medium",
  "high",
  "critical",
];

const statusLabels: Record<IncidentStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const severityStyles: Record<IncidentSeverity, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const statusStyles: Record<IncidentStatus, string> = {
  open: "bg-red-50 text-red-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<OrganizerEvent[]>([]);

  const [activeFilter, setActiveFilter] =
    useState<StatusFilter>("all");
  const [selectedEventFilter, setSelectedEventFilter] =
    useState("all");

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

  const loadIncidents = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const result = await getIncidents(
        selectedEventFilter === "all"
          ? undefined
          : selectedEventFilter,
      );

      setIncidents(Array.isArray(result) ? result : []);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load incidents.",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [selectedEventFilter]);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);

    try {
      const response = await getMyEvents();
      const eventList = Array.isArray(response)
        ? response as OrganizerEvent[]
        : [];

      setEvents(eventList);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    void loadIncidents(true);

    const interval = window.setInterval(() => {
      void loadIncidents();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadIncidents]);

  const filteredIncidents = useMemo(() => {
    if (activeFilter === "all") {
      return incidents;
    }

    return incidents.filter(
      (incident) => incident.status === activeFilter,
    );
  }, [incidents, activeFilter]);

  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(
    (incident) => incident.status === "open",
  ).length;
  const inProgressIncidents = incidents.filter(
    (incident) => incident.status === "in_progress",
  ).length;
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "resolved",
  ).length;

  function resetForm() {
    setEventId("");
    setTitle("");
    setDescription("");
    setLocation("");
    setSeverity("medium");
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventId) {
      setError("Please select an event.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await createIncident({
        eventId,
        title: title.trim(),
        description: description.trim(),
        severity,
        location: location.trim() || undefined,
      });

      resetForm();
      setShowForm(false);
      setSuccess("Incident reported successfully.");

      await loadIncidents();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to report incident.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(
    incidentId: string,
    status: IncidentStatus,
  ) {
    setUpdatingId(incidentId);
    setError("");
    setSuccess("");

    try {
      const updatedIncident = await updateIncident(incidentId, {
        status,
      });

      setIncidents((previous) =>
        previous.map((incident) =>
          incident.id === incidentId
            ? updatedIncident
            : incident,
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
  }

  async function handleDelete(incidentId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this incident?",
    );

    if (!confirmed) return;

    setDeletingId(incidentId);
    setError("");
    setSuccess("");

    try {
      await deleteIncident(incidentId);

      setIncidents((previous) =>
        previous.filter((incident) => incident.id !== incidentId),
      );

      setSuccess("Incident deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete incident.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Incident Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review reports and manage incidents across your events.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void loadIncidents(true)}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>

          <button
            onClick={() => {
              setShowForm((previous) => !previous);
              setError("");
              setSuccess("");
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Close Form" : "+ Report Incident"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Report a New Incident
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Submit an incident you noticed at one of your events.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Event
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                disabled={eventsLoading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as IncidentSeverity)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Incident Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Briefly describe the incident"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Provide details about what happened..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Location (Optional)
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={150}
              placeholder="e.g. Main Gate, Hall A"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || eventsLoading || events.length === 0}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Incident"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Incidents",
            value: totalIncidents,
            color: "text-slate-800",
          },
          {
            label: "Open",
            value: openIncidents,
            color: "text-red-600",
          },
          {
            label: "In Progress",
            value: inProgressIncidents,
            color: "text-amber-600",
          },
          {
            label: "Resolved",
            value: resolvedIncidents,
            color: "text-emerald-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter.value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <select
          value={selectedEventFilter}
          onChange={(e) => setSelectedEventFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="all">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading incidents...
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="font-semibold text-slate-700">
            No incidents found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            There are no incidents matching the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {incident.title}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityStyles[incident.severity]}`}
                    >
                      {incident.severity.toUpperCase()}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[incident.status]}`}
                    >
                      {statusLabels[incident.status]}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {incident.description}
                  </p>
                </div>

                <button
                  onClick={() => void handleDelete(incident.id)}
                  disabled={deletingId === incident.id}
                  className="self-start rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === incident.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Event
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {incident.event?.title ||
                      events.find((event) => event.id === incident.eventId)?.title ||
                      "Event"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Reported By
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {incident.reportedBy?.fullName || "Unknown reporter"}
                  </p>
                  {incident.reportedBy?.email && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {incident.reportedBy.email}
                    </p>
                  )}
                  {incident.reportedById === incident.organizerId && (
                    <span className="mt-1 inline-block text-xs font-medium text-blue-600">
                      Event Organizer
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Location
                  </p>
                  <p className="mt-1 text-slate-700">
                    {incident.location || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Reported On
                  </p>
                  <p className="mt-1 text-slate-700">
                    {formatDate(incident.createdAt)}
                  </p>
                </div>

                {incident.resolvedAt && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Resolved On
                    </p>
                    <p className="mt-1 text-emerald-700">
                      {formatDate(incident.resolvedAt)}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor={`status-${incident.id}`}
                  className="text-sm font-medium text-slate-600"
                >
                  Update Status
                </label>

                <select
                  id={`status-${incident.id}`}
                  value={incident.status}
                  disabled={updatingId === incident.id}
                  onChange={(e) =>
                    void handleStatusChange(
                      incident.id,
                      e.target.value as IncidentStatus,
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

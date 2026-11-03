
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../../lib/authApi";
import StatusBadge from "../../components/organizer/StatusBadge";

const VITE_API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : window.location.hostname === "172.16.78.105"
      ? "http://172.16.78.105:3000"
      : "https://eventpulse-toa3.onrender.com";

const filters = [
  "All",
  "Upcoming",
  "Ongoing",
  "Completed",
  "Draft",
  "Cancelled",
];

type BackendEvent = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  price?: string | number;
  bannerImage?: string | null;
  status: string;
};

type EventRegistrationCount = {
  eventId: string;
  count: number;
};

type OrganizerEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  endDate: string;
  venue: string;
  capacity: number;
  registered: number;
  status: string;
};

function mapEvent(event: BackendEvent): OrganizerEvent {
  return {
    id: event.id,
    title: event.title,
    category: event.category || "General",
    date: event.startDate,
    endDate: event.endDate,
    venue: event.location || "Venue not specified",
    capacity: Number(event.capacity) || 0,
    registered: 0,
    status: event.status.toLowerCase(),
  };
}

function getEventStatus(event: OrganizerEvent) {
  const status = event.status.toLowerCase();

  if (status === "draft") return "Draft";
  if (status === "cancelled") return "Cancelled";

  const now = new Date();
  const startDate = new Date(event.date);
  const endDate = new Date(event.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Upcoming";
  }

  if (endDate < now) return "Completed";
  if (startDate > now) return "Upcoming";

  return "Ongoing";
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

async function getResponseError(response: Response) {
  const responseError = await response.json().catch(() => null);

  if (Array.isArray(responseError?.message)) {
    return responseError.message.join(", ");
  }

  return responseError?.message || `Request failed (${response.status}).`;
}

export default function EventsList() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [eventsResult, countsResult] = await Promise.allSettled([
        fetch(`${VITE_API_BASE_URL}/events/my-events`, {
          headers: getAuthHeaders(),
        }),
        fetch(
          `${VITE_API_BASE_URL}/registrations/organizer/event-registration-counts`,
          {
            headers: getAuthHeaders(),
          },
        ),
      ]);

      if (eventsResult.status === "rejected") {
        throw eventsResult.reason;
      }

      const eventsResponse = eventsResult.value;

      if (!eventsResponse.ok) {
        throw new Error(await getResponseError(eventsResponse));
      }

      const eventData: BackendEvent[] = await eventsResponse.json();

      let registrationCounts: EventRegistrationCount[] = [];

      if (countsResult.status === "fulfilled") {
        if (countsResult.value.ok) {
          registrationCounts = await countsResult.value.json();
        } else {
          setError(
            "Events loaded, but registration counts could not be loaded.",
          );
        }
      } else {
        setError(
          "Events loaded, but registration counts could not be loaded.",
        );
      }

      const countByEventId = new Map(
        registrationCounts.map((item) => [
          item.eventId,
          Number(item.count),
        ]),
      );

      setEvents(
        eventData.map((event) => ({
          ...mapEvent(event),
          registered: countByEventId.get(event.id) ?? 0,
        })),
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  async function publishEvent(eventId: string) {
    if (publishingId || cancellingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to publish this draft event?",
    );

    if (!confirmed) return;

    setPublishingId(eventId);
    setError("");

    try {
      const response = await fetch(
        `${VITE_API_BASE_URL}/events/${eventId}/publish`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      await loadEvents();
    } catch (publishError) {
      setError(getErrorMessage(publishError));
    } finally {
      setPublishingId(null);
    }
  }

  async function cancelEvent(eventId: string) {
    if (publishingId || cancellingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this event? It will remain in your event history, but it will no longer be available to attendees.",
    );

    if (!confirmed) return;

    setCancellingId(eventId);
    setError("");

    try {
      const response = await fetch(
        `${VITE_API_BASE_URL}/events/${eventId}/cancel`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(await getResponseError(response));
      }

      await loadEvents();
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
    } finally {
      setCancellingId(null);
    }
  }

  const filteredEvents = events.filter((event) => {
    if (activeFilter === "All") return true;

    return getEventStatus(event) === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            My Events
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your events and track registrations.
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          + Create Event
        </Link>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => void loadEvents()}
            className="shrink-0 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === filter
                ? "bg-indigo-600 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* EVENTS TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Loading events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-gray-800">
              {events.length === 0
                ? "You haven't created any events yet."
                : "No events match this filter."}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {events.length === 0
                ? "Create an event to see it listed here."
                : "Try selecting another filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Event
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Registrations
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event);

                  const isDraft = event.status === "draft";
                  const isPublished = event.status === "published";
                  const isCancelled = event.status === "cancelled";

                  const isBusy =
                    publishingId === event.id ||
                    cancellingId === event.id;

                  return (
                    <tr
                      key={event.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {event.title}
                        </div>

                        <div className="mt-1 text-sm text-gray-500">
                          {event.category} · {event.venue}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDate(event.date)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {event.registered.toLocaleString()} /{" "}
                        {event.capacity.toLocaleString()}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge status={status} />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/organizer/events/${event.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            View
                          </Link>

                          {!isCancelled && (
                            <Link
                              to={`/organizer/events/${event.id}/edit`}
                              className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                              Edit
                            </Link>
                          )}

                          {isDraft && (
                            <button
                              type="button"
                              onClick={() =>
                                void publishEvent(event.id)
                              }
                              disabled={isBusy}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {publishingId === event.id
                                ? "Publishing..."
                                : "Publish"}
                            </button>
                          )}

                          {(isDraft || isPublished) && (
                            <button
                              type="button"
                              onClick={() =>
                                void cancelEvent(event.id)
                              }
                              disabled={isBusy}
                              className="text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {cancellingId === event.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-sm text-gray-500">
        Showing {filteredEvents.length} of {events.length} events
      </div>
    </div>
  );
}

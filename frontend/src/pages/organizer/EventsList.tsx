import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../../lib/authApi";
import StatusBadge from "../../components/organizer/StatusBadge";

const API_BASE_URL = "http://localhost:3000";

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
    venue: event.location || "Venue not specified",
    capacity: Number(event.capacity) || 0,
    registered: 0,
    status: event.status,
  };
}

function getEventStatus(event: OrganizerEvent) {
  if (event.status.toLowerCase() === "draft") return "Draft";
  if (event.status.toLowerCase() === "cancelled") return "Cancelled";

  const now = new Date();
  const startDate = new Date(event.date);

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
    : "Something went wrong while loading events.";
}

export default function EventsList() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [eventsResponse, countsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/events/my-events`, {
          headers: getAuthHeaders(),
        }),
        fetch(
          `${API_BASE_URL}/registrations/organizer/event-registration-counts`,
          {
            headers: getAuthHeaders(),
          },
        ),
      ]);

      if (!eventsResponse.ok) {
        const responseError = await eventsResponse
          .json()
          .catch(() => null);

        throw new Error(
          responseError?.message || "Failed to load your events.",
        );
      }

      if (!countsResponse.ok) {
        const responseError = await countsResponse
          .json()
          .catch(() => null);

        throw new Error(
          responseError?.message ||
            "Failed to load event registration counts.",
        );
      }

      const eventData: BackendEvent[] = await eventsResponse.json();
      const registrationCounts: EventRegistrationCount[] =
        await countsResponse.json();

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
    setPublishingId(eventId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/events/${eventId}/publish`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        const responseError = await response.json().catch(() => null);

        throw new Error(
          responseError?.message || "Failed to publish event.",
        );
      }

      await loadEvents();
    } catch (publishError) {
      setError(getErrorMessage(publishError));
    } finally {
      setPublishingId(null);
    }
  }

  const filteredEvents = events.filter((event) => {
    if (activeFilter === "All") return true;

    return getEventStatus(event) === activeFilter;
  });

  return (
    <div className="space-y-6">
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
            <table className="w-full min-w-760px text-left">
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

                          {status === "Draft" && (
                            <button
                              type="button"
                              onClick={() =>
                                void publishEvent(event.id)
                              }
                              disabled={publishingId === event.id}
                              className="text-sm font-medium text-emerald-600 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {publishingId === event.id
                                ? "Publishing..."
                                : "Publish"}
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

      <div className="text-sm text-gray-500">
        Showing {filteredEvents.length} of {events.length} events
      </div>
    </div>
  );
}
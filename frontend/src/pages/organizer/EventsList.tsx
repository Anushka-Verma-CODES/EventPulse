import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../../lib/authApi";
import StatusBadge from "../../components/organizer/StatusBadge";

const API_BASE_URL = "http://localhost:3000";
const filters = ["All", "Upcoming", "Ongoing", "Completed", "Draft", "Cancelled"];

type BackendEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  price: string;
  status: "draft" | "published" | "cancelled";
  organizerId: string;
};

type OrganizerEvent = {
  id: string;
  name: string;
  date: string;
  venue: string;
  registered: number;
  capacity: number;
  status: string;
  startDate: string;
  endDate: string;
};

function getDisplayStatus(event: BackendEvent): string {
  if (event.status === "draft") return "Draft";
  if (event.status === "cancelled") return "Cancelled";

  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (now < start) return "Upcoming";
  if (now <= end) return "Ongoing";
  return "Completed";
}

function mapEvent(event: BackendEvent): OrganizerEvent {
  return {
    id: event.id,
    name: event.title,
    date: new Date(event.startDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    venue: event.location,
    registered: 0,
    capacity: event.capacity,
    status: getDisplayStatus(event),
    startDate: event.startDate,
    endDate: event.endDate,
  };
}

export default function EventsList() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/events/my-events`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = Array.isArray(body?.message)
          ? body.message.join(", ")
          : body?.message;

        throw new Error(message || `Failed to load events (${response.status}).`);
      }

      const data: BackendEvent[] = await response.json();
      setEvents(data.map(mapEvent));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events.");
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
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = Array.isArray(body?.message)
          ? body.message.join(", ")
          : body?.message;

        throw new Error(message || `Failed to publish event (${response.status}).`);
      }

      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish event.");
    } finally {
      setPublishingId(null);
    }
  }

  const filtered =
    activeFilter === "All"
      ? events
      : events.filter((event) => event.status === activeFilter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">My Events</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage your upcoming and past events.
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          + Create Event
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-[#E2E8F0]">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Venue</th>
              <th className="px-4 py-3 font-medium">Registrations</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                  Loading your events...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                  No events found in this filter.
                </td>
              </tr>
            ) : (
              filtered.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-3 font-medium text-[#1E293B]">
                    {event.name}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">{event.date}</td>
                  <td className="px-4 py-3 text-[#64748B]">{event.venue}</td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {event.registered.toLocaleString()} / {event.capacity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={event.status as "Upcoming" | "Ongoing" | "Completed" | "Draft"} />
                    {event.status === "Cancelled" && (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={`/organizer/events/${event.id}`}
                        className="text-xs font-medium text-[#2563EB] hover:underline"
                      >
                        View
                      </Link>

                      {event.status === "Draft" && (
                        <button
                          type="button"
                          disabled={publishingId === event.id}
                          onClick={() => void publishEvent(event.id)}
                          className="text-xs font-medium text-emerald-700 hover:underline disabled:opacity-50"
                        >
                          {publishingId === event.id ? "Publishing..." : "Publish"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
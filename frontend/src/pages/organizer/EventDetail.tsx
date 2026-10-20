
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthHeaders } from "../../lib/authApi";

const API_BASE_URL = "http://localhost:3000";

const tabs = [
  "Overview",
  "Attendees",
  "Tickets",
  "Gates",
  "Volunteers",
  "Resources",
  "Incidents",
  "Reports",
];

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
  bannerImage: string | null;
  status: "draft" | "published" | "cancelled";
  organizerId: string;
  createdAt: string;
  updatedAt: string;
};

function formatDateTime(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date and time unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = Array.isArray(body?.message)
          ? body.message.join(", ")
          : body?.message;

        throw new Error(
          message || `Failed to load event (${response.status}).`
        );
      }

      const data: BackendEvent = await response.json();

      console.log("Event API response:", data);
      console.log("Event start date:", data.startDate);
      console.log("Event end date:", data.endDate);

      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  async function publishEvent() {
    if (!eventId) return;

    setPublishing(true);
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

        throw new Error(
          message || `Failed to publish event (${response.status}).`
        );
      }

      await loadEvent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish event.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="py-10 text-sm text-[#64748B]">
        Loading event...
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-700">{error}</p>

        <button
          type="button"
          onClick={() => void loadEvent()}
          className="mt-3 text-sm font-medium text-[#2563EB]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <p className="text-sm text-[#64748B]">
        Event not found.
      </p>
    );
  }

  const statusLabel =
    event.status.charAt(0).toUpperCase() + event.status.slice(1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            {event.title}
          </h2>

          <div className="mt-3 space-y-2 text-sm text-[#64748B]">
            <p>
              <span className="font-semibold text-[#1E293B]">
                Starts:
              </span>{" "}
              {formatDateTime(event.startDate)}
            </p>

            <p>
              <span className="font-semibold text-[#1E293B]">
                Ends:
              </span>{" "}
              {formatDateTime(event.endDate)}
            </p>

            <p>
              <span className="font-semibold text-[#1E293B]">
                Venue:
              </span>{" "}
              {event.location}
            </p>
          </div>

          <p className="mt-3 text-xs text-[#64748B]">
            Status:{" "}
            <span className="font-semibold">{statusLabel}</span>
            {" · "}
            {event.category}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            Edit Event
          </button>

          {event.status === "draft" && (
            <button
              type="button"
              disabled={publishing}
              onClick={() => void publishEvent()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish Event"}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(`/events/${event.id}`)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
          >
            View Public Page
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            0
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            Registrations
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            0
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            Checked In
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {event.capacity.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            Remaining capacity
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {event.capacity.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">
            Total Capacity
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#E2E8F0]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        {activeTab === "Overview" ? (
          <div className="space-y-5 text-sm text-[#64748B]">
            <div>
              <h3 className="font-semibold text-[#1E293B]">
                Description
              </h3>

              <p className="mt-1 whitespace-pre-wrap">
                {event.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#1E293B]">
                Event details
              </h3>

              <p className="mt-2">
                Category: {event.category}
              </p>

              <p className="mt-2">
                Venue: {event.location}
              </p>

              <p className="mt-2">
                Starts: {formatDateTime(event.startDate)}
              </p>

              <p className="mt-2">
                Ends: {formatDateTime(event.endDate)}
              </p>

              <p className="mt-2">
                Capacity: {event.capacity.toLocaleString("en-IN")}
              </p>

              <p className="mt-2">
                Ticket price: ₹
                {Number(event.price).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#64748B]">
            {activeTab} for this event isn't connected to real data yet.
          </p>
        )}
      </div>
    </div>
  );
}

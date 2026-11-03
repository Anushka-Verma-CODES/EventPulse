
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuthHeaders } from "../../lib/authApi";

const VITE_API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : window.location.hostname === "172.16.78.105"
      ? "http://172.16.78.105:3000"
      : "https://eventpulse-toa3.onrender.com";

type BackendEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  price: string | number;
  bannerImage: string | null;
  status: "draft" | "published" | "cancelled";
};

function toLocalDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );

  return localDate.toISOString().slice(0, 16);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${VITE_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;

    throw new Error(message || `Request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export default function EditEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [price, setPrice] = useState(0);
  const [bannerImage, setBannerImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) {
        setError("Event ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const data = await request<BackendEvent>(`/events/${eventId}`);

        if (data.status === "cancelled") {
          setEvent(data);
          setError("Cancelled events cannot be edited.");
          return;
        }

        setEvent(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setLocation(data.location);
        setStartDate(toLocalDateTime(data.startDate));
        setEndDate(toLocalDateTime(data.endDate));
        setCapacity(Number(data.capacity));
        setPrice(Number(data.price));
        setBannerImage(data.bannerImage || "");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load event.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadEvent();
  }, [eventId]);

  async function handleSubmit(
    formEvent: React.FormEvent<HTMLFormElement>,
  ) {
    formEvent.preventDefault();

    if (!eventId || !event || saving) return;

    setError("");

    if (new Date(endDate) <= new Date(startDate)) {
      setError(
        "End date and time must be later than the start date and time.",
      );
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      setError("Capacity must be a positive whole number.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Ticket price cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      await request<BackendEvent>(`/events/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          location: location.trim(),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          capacity,
          price,
          bannerImage: bannerImage.trim() || undefined,
        }),
      });

      navigate(`/organizer/events/${eventId}`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update event.",
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]";

  if (loading) {
    return (
      <p className="py-10 text-sm text-[#64748B]">
        Loading event...
      </p>
    );
  }

  if (!event || event.status === "cancelled") {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <p className="text-sm text-red-700">
          {error || "This event cannot be edited."}
        </p>

        <Link
          to={eventId ? `/organizer/events/${eventId}` : "/organizer/events"}
          className="mt-4 inline-block text-sm font-medium text-[#2563EB]"
        >
          Back to event
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={`/organizer/events/${event.id}`}
          className="text-sm font-medium text-[#2563EB] hover:underline"
        >
          ← Back to event
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-[#1E293B]">
          Edit Event
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Update the event information. Changes are saved to the database.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-[#334155]">
            Event title
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#334155]">
            Description
          </label>
          <textarea
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#334155]">
              Category
            </label>
            <input
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#334155]">
              Venue
            </label>
            <input
              className={inputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#334155]">
              Starts at
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#334155]">
              Ends at
            </label>
            <input
              type="datetime-local"
              className={inputClass}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#334155]">
              Capacity
            </label>
            <input
              type="number"
              className={inputClass}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={1}
              step={1}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#334155]">
              Ticket price (₹)
            </label>
            <input
              type="number"
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={0}
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#334155]">
            Banner image URL (optional)
          </label>
          <input
            type="url"
            className={inputClass}
            value={bannerImage}
            onChange={(e) => setBannerImage(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#E2E8F0] pt-5">
          <Link
            to={`/organizer/events/${event.id}`}
            className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]"
          >
            Discard
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

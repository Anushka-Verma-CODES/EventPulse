
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  startDate: string;
  endDate?: string;
  status?: string;
};

const filters = ["All", "Upcoming", "Near Me", "My Interests"];

export default function Opportunities() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:3000/events");

        if (!response.ok) {
          throw new Error("Unable to load events. Please try again.");
        }

        const data: EventItem[] = await response.json();

        setEvents(
          data.filter(
            (event) =>
              !event.status ||
              event.status.toLowerCase() === "published"
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading events."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filtered = events.filter((event) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      event.title.toLowerCase().includes(query) ||
      (event.description ?? "").toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query);

    const eventDate = new Date(event.startDate);
    const matchesUpcoming =
      activeFilter !== "Upcoming" ||
      (!Number.isNaN(eventDate.getTime()) &&
        eventDate.getTime() >= new Date().setHours(0, 0, 0, 0));

    return matchesSearch && matchesUpcoming;
  });

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date to be announced";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">
        Volunteer Opportunities
      </h2>

      <p className="mt-1 text-sm text-[#64748B]">
        Find events where you can contribute.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search events by name, location, or description..."
        className="mt-4 w-full max-w-md rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && (
        <p className="mt-6 text-sm text-[#64748B]">
          Loading published events...
        </p>
      )}

      {!loading && error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6 text-center">
          <h3 className="font-semibold text-[#1E293B]">
            No events found
          </h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Try another search or check back when more events are published.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold text-[#1E293B]">
                {event.title}
              </h3>

              <div className="mt-2 text-xs text-[#64748B]">
                &#128197; {formatDate(event.startDate)}
                &nbsp; &#128205; {event.location}
              </div>

              <div className="mt-3 text-sm font-medium text-[#1E293B]">
                Volunteer
              </div>

              <p className="mt-1 text-sm text-[#64748B]">
                {event.description || "Explore this event and apply to volunteer."}
              </p>

              <div className="mt-3 text-xs text-[#64748B]">
                Submit an application to volunteer at this event.
              </div>

              <Link
                to={`/volunteer/opportunities/${event.id}`}
                className="mt-4 inline-block rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
              >
                View Opportunity
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

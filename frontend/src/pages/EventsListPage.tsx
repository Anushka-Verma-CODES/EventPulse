
import { useEffect, useMemo, useState } from "react";
import type { EventItem } from "../types/event";
import { getEvents } from "../features/events/api/eventsApi";
import { EventCard } from "../features/events/components/EventCard";

type DateFilter = "all" | "upcoming" | "past";
type SortOption = "soonest" | "latest" | "price-low" | "price-high";

export default function EventsListPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("soonest");

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await getEvents();

        if (isMounted) {
          setEvents(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load events. Please try again.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.category)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const now = Date.now();

    const filtered = events.filter((event) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          event.name,
          event.shortDescription,
          event.fullDescription,
          event.venue,
          event.category,
        ].some((value) =>
          value?.toLowerCase().includes(normalizedSearch),
        );

      const matchesCategory =
        !activeCategory || event.category === activeCategory;

      const eventStart = new Date(event.startDate).getTime();

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "upcoming" && eventStart >= now) ||
        (dateFilter === "past" && eventStart < now);

      return matchesSearch && matchesCategory && matchesDate;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();

      switch (sortBy) {
        case "latest":
          return dateB - dateA;

        case "price-low":
          return a.price - b.price;

        case "price-high":
          return b.price - a.price;

        case "soonest":
        default:
          return dateA - dateB;
      }
    });
  }, [events, search, activeCategory, dateFilter, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" ||
    activeCategory !== null ||
    dateFilter !== "all" ||
    sortBy !== "soonest";

  function clearFilters() {
    setSearch("");
    setActiveCategory(null);
    setDateFilter("all");
    setSortBy("soonest");
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <style>{`
        @keyframes eventsHeroDrift {
          0%, 100% { background-position: 50% 50%; }
          50% { background-position: 56% 44%; }
        }

        @keyframes eventCardEnter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .event-card-enter {
          animation: eventCardEnter 0.55s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .events-hero-motion, .event-card-enter {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="hero events-hero-motion relative bg-cover bg-center py-14 text-neutral-content"
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,23,23,0.75), rgba(23,23,23,0.75)), url('/event-hero.png')",
          animation: "eventsHeroDrift 14s ease-in-out infinite",
        }}
      >
        <div className="hero-content w-full max-w-6xl flex-col items-start">
          <h1 className="mb-1 text-3xl font-bold">
            What's happening on campus
          </h1>

          <p className="mb-6 opacity-70">
            Discover events, explore opportunities and register.
          </p>

          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search by event name, venue, category or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input input-bordered w-full pr-10 text-black"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-white p-5 text-sm text-red-600"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!error && (
          <>
            <div className="mb-6 border-b border-base-300 pb-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">
                  Filter Events
                </h2>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(null)}
                    className={`btn btn-sm ${
                      activeCategory === null
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    All Categories
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setActiveCategory(
                          activeCategory === category ? null : category,
                        )
                      }
                      className={`btn btn-sm ${
                        activeCategory === category
                          ? "btn-primary"
                          : "btn-outline"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-date-filter"
                    className="mb-2 block text-sm font-medium"
                  >
                    Event Date
                  </label>

                  <select
                    id="event-date-filter"
                    value={dateFilter}
                    onChange={(event) =>
                      setDateFilter(event.target.value as DateFilter)
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="all">All Dates</option>
                    <option value="upcoming">Upcoming Events</option>
                    <option value="past">Past Events</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="event-sort"
                    className="mb-2 block text-sm font-medium"
                  >
                    Sort By
                  </label>

                  <select
                    id="event-sort"
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as SortOption)
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="soonest">Date: Soonest First</option>
                    <option value="latest">Date: Latest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-base-content/70">
                Showing{" "}
                <span className="font-bold text-base-content">
                  {filteredEvents.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-base-content">
                  {events.length}
                </span>{" "}
                events
              </p>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-base-300 bg-base-100 py-16 text-center">
                <h3 className="text-lg font-semibold">
                  No events found
                </h3>

                <p className="mt-2 text-sm text-base-content/60">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-primary btn-sm mt-5"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="event-card-enter"
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

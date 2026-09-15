import { useEffect, useMemo, useState } from 'react';
import type { EventItem } from '../types/event';
import { getEvents } from '../features/events/api/eventsApi';
import { EventCard } from '../features/events/components/EventCard';

export default function EventsListPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => Array.from(new Set(events.map((e) => e.category))), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || e.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, search, activeCategory]);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
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
          .events-hero-motion, .event-card-enter { animation: none !important; }
        }
      `}</style>

<div
  className="hero events-hero-motion relative bg-cover bg-center py-14 text-neutral-content"
  style={{
    backgroundImage:
      "linear-gradient(rgba(23,23,23,0.75), rgba(23,23,23,0.75)), url('/event-hero.png')",
    animation: 'eventsHeroDrift 14s ease-in-out infinite',
  }}
>
  <div className="hero-content flex-col items-start max-w-6xl w-full">
    <h1 className="text-3xl font-bold mb-1">What's happening on campus</h1>
    <p className="opacity-70 mb-6">Browse and register for upcoming events</p>

    <input
      type="text"
      placeholder="Search events…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="input input-bordered w-full max-w-md text-black"
    />
  </div>
</div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`btn btn-sm ${activeCategory === null ? 'btn-primary' : 'btn-outline'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center text-base-content/50 py-16">No events match your search.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="event-card-enter"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
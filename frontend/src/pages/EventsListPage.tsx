import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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


<div
  className="hero py-14 text-neutral-content bg-cover bg-center relative"
  style={{
    backgroundImage:
      "linear-gradient(rgba(23,23,23,0.75), rgba(23,23,23,0.75)), url('/event-hero.png')",
  }}
>
  <Link to="/events/new" className="btn btn-primary absolute top-0 right-6">
     Create Event
  </Link>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import type { EventItem } from '../types/event';
import { getEvents } from '../features/events/api/eventsApi';
import { EventCard } from '../features/events/components/EventCard';
import { EventCardSkeleton } from '../components/ui/SkeletonCard';

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

  const categories = useMemo(
    () => Array.from(new Set(events.map((e) => e.category))),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.shortDescription.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || e.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, search, activeCategory]);

  return (
    <div style={{ minHeight: '100vh', background: '#000000' }}>
      {/* ─── Ultra-Minimal Hero Section ───────────────────────────── */}
      <section
        style={{
          padding: '56px 24px 48px',
          borderBottom: '1px solid #1f1f1f',
          background: '#000000',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow */}
          <div
            className="animate-fade-in"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '3px 12px', borderRadius: '4px',
              background: '#121212',
              border: '1px solid #262626',
              fontSize: '11px', fontWeight: 700, color: '#E50914',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E50914', display: 'inline-block' }} />
            EventPulse Original
          </div>

          {/* Heading */}
          <h1
            className="animate-slide-up"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(30px, 5vw, 52px)',
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#FFFFFF',
              marginBottom: '14px',
              letterSpacing: '-0.02em',
            }}
          >
            What's happening{' '}
            <span style={{ color: '#E50914' }}>
              on campus
            </span>
          </h1>

          <p
            className="animate-slide-up"
            style={{
              fontSize: '15px', color: '#737373',
              lineHeight: 1.6, marginBottom: '28px',
              maxWidth: '480px', margin: '0 auto 28px',
            }}
          >
            Browse, register, and generate instant QR tickets for campus events, tech fests, and workshops.
          </p>

          {/* Search bar */}
          <div
            className="animate-slide-up"
            style={{
              maxWidth: '500px',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              color: '#525252', pointerEvents: 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              id="event-search"
              placeholder="Search events, workshops, festivals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base"
              style={{
                paddingLeft: '42px',
                fontSize: '14px',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#262626',
                  border: 'none', borderRadius: '3px',
                  width: '22px', height: '22px',
                  color: '#ffffff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px',
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Stats row */}
        {!loading && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <StatPill label={`${events.length} Total Events`} />
            <StatPill label={`${events.filter(e => e.isRegistered).length} Registered`} highlight />
            <StatPill label={`${events.filter(e => (e.capacityTotal - e.capacityRegistered) < e.capacityTotal * 0.15).length} Filling Fast`} warning />
          </div>
        )}

        {/* Category filters */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex', gap: '6px',
            marginBottom: '24px', flexWrap: 'wrap',
          }}
        >
          <CategoryPill
            label="All Events"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {categories.map(cat => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            />
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState hasSearch={search.length > 0} onClear={() => { setSearch(''); setActiveCategory(null); }} />
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#737373', marginBottom: '16px' }}>
              Showing <strong style={{ color: '#ffffff' }}>{filteredEvents.length}</strong>{' '}
              {filteredEvents.length === 1 ? 'event' : 'events'}
              {activeCategory ? ` in ${activeCategory}` : ''}
              {search ? ` matching "${search}"` : ''}
            </p>
            <div
              className="stagger-children"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredEvents.map((event, i) => (
                <EventCard key={event.id} event={event} animationDelay={i * 30} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatPill({ label, highlight, warning }: { label: string; highlight?: boolean; warning?: boolean }) {
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 500,
      color: highlight ? '#22c55e' : warning ? '#eab308' : '#a3a3a3',
      background: '#121212',
      border: '1px solid #262626',
    }}>
      {label}
    </span>
  );
}

function CategoryPill({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      id={`filter-${label.replace(/\s+/g, '-').toLowerCase()}`}
      style={{
        padding: '5px 12px', borderRadius: '4px',
        fontSize: '12px', fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        border: active ? '1px solid #E50914' : '1px solid #262626',
        color: active ? '#ffffff' : '#888888',
        background: active ? '#E50914' : '#121212',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {label}
    </button>
  );
}

function EmptyState({ hasSearch, onClear }: { hasSearch: boolean; onClear: () => void }) {
  return (
    <div
      className="animate-fade-in"
      style={{
        textAlign: 'center',
        padding: '64px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', color: '#ffffff', margin: 0 }}>
        {hasSearch ? 'No matching events' : 'No events found'}
      </h3>
      <p style={{ color: '#737373', fontSize: '13px', maxWidth: '300px', margin: 0 }}>
        {hasSearch
          ? 'Try adjusting your search query or clear active category filters.'
          : 'Check back soon for new campus event releases.'}
      </p>
      {hasSearch && (
        <button
          onClick={onClear}
          style={{
            marginTop: '8px',
            padding: '7px 16px',
            borderRadius: '4px',
            border: 'none',
            background: '#E50914',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
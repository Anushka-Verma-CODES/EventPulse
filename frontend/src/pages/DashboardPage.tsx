import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/* ─── Mock Data ──────────────────────────────────────────────────── */
const MOCK_STATS = [
  { id: 'total-events',         label: 'Total Events',          value: 12,   sub: '3 upcoming' },
  { id: 'total-registrations',  label: 'Total Registrations',   value: 2847, sub: '+142 this week' },
  { id: 'checkins-today',       label: 'Check-ins Today',       value: 318,  sub: '74% of registered' },
  { id: 'active-volunteers',    label: 'Active Volunteers',     value: 24,   sub: '8 on duty now' },
];

interface EventRow {
  id: string;
  name: string;
  date: string;
  category: string;
  registered: number;
  capacity: number;
  status: 'upcoming' | 'live' | 'completed' | 'draft';
}

const MOCK_EVENTS: EventRow[] = [
  { id: 'evt_001', name: 'Ascend — Tech Fest',      date: 'Sat, 21 Mar 2026', category: 'Tech Fest', registered: 742, capacity: 1000, status: 'upcoming' },
  { id: 'evt_002', name: 'CodeCraft Workshop',       date: 'Wed, 4 Feb 2026',  category: 'Workshop',  registered: 58,  capacity: 60,   status: 'live' },
  { id: 'evt_003', name: 'Rhythms — Cultural Night', date: 'Fri, 13 Feb 2026', category: 'Cultural',  registered: 1310,capacity: 2000, status: 'completed' },
  { id: 'evt_004', name: 'Career Fair 2026',         date: 'Mon, 9 Mar 2026',  category: 'Seminar',   registered: 0,   capacity: 500,  status: 'draft' },
];

const statusConfig: Record<EventRow['status'], { label: string; color: string; bg: string; border: string }> = {
  upcoming:  { label: 'Upcoming',  color: '#e5e5e5', bg: 'rgba(255,255,255,0.06)', border: '#262626' },
  live:      { label: 'Live',      color: '#ffffff', bg: '#E50914', border: '#E50914' },
  completed: { label: 'Ended',     color: '#737373', bg: 'transparent', border: '#262626' },
  draft:     { label: 'Draft',     color: '#a3a3a3', bg: 'rgba(255,255,255,0.03)', border: '#262626' },
};

/* ─── Animated counter hook ──────────────────────────────────────── */
function useAnimatedCount(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [filterStatus, setFilterStatus] = useState<EventRow['status'] | 'all'>('all');

  const filteredEvents = filterStatus === 'all'
    ? MOCK_EVENTS
    : MOCK_EVENTS.filter(e => e.status === filterStatus);

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#ffffff' }}>
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid #262626',
        padding: '32px 0 28px',
        background: '#000000',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '4px 10px', borderRadius: '4px',
                background: '#121212', border: '1px solid #262626',
                fontSize: '11px', fontWeight: 600, color: '#E50914',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E50914', display: 'inline-block' }} />
                Organizer Console
              </div>
              <h1 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 800, color: '#ffffff',
                margin: 0, letterSpacing: '-0.02em',
              }}>
                Dashboard
              </h1>
              <p style={{ color: '#737373', fontSize: '13px', marginTop: '4px' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link
              to="/create-event"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '4px',
                background: '#E50914',
                color: '#ffffff', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#B81D24'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#E50914'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Event
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* ─── Stat Cards ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          {MOCK_STATS.map(stat => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>

        {/* ─── Quick Actions ─────────────────────────────────────── */}
        <div
          style={{
            display: 'flex', gap: '10px', flexWrap: 'wrap',
            marginBottom: '32px',
          }}
        >
          <QuickAction label="Export Report" />
          <QuickAction label="Email Attendees" />
          <QuickAction label="Manage Volunteers" />
          <QuickAction label="Scan Check-ins" href="/scanner" />
        </div>

        {/* ─── Events Table ─────────────────────────────────────── */}
        <div>
          {/* Table header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px',
          }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px', fontWeight: 700,
              color: '#ffffff', margin: 0, letterSpacing: '-0.01em',
            }}>
              Managed Events
            </h2>
            {/* Status filter */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['all', 'live', 'upcoming', 'completed', 'draft'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  id={`filter-${s}`}
                  style={{
                    padding: '5px 14px', borderRadius: '4px',
                    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                    border: filterStatus === s ? '1px solid #E50914' : '1px solid #262626',
                    background: filterStatus === s ? '#E50914' : '#121212',
                    color: filterStatus === s ? '#ffffff' : '#a3a3a3',
                    textTransform: 'capitalize',
                  }}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div style={{
            background: '#121212',
            border: '1px solid #262626',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            {/* Table head */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 100px 80px',
              padding: '12px 20px',
              borderBottom: '1px solid #262626',
              gap: '12px',
              background: '#171717',
            }}
              className="events-table-row"
            >
              {['Event', 'Date', 'Registrations', 'Status', ''].map(h => (
                <span key={h} style={{
                  fontSize: '11px', fontWeight: 600, color: '#737373',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filteredEvents.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#737373', fontSize: '13px' }}>No events found matching this status.</p>
              </div>
            ) : (
              filteredEvents.map((event, i) => (
                <EventTableRow key={event.id} event={event} index={i} total={filteredEvents.length} />
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .events-table-row {
            grid-template-columns: 1fr 1fr !important;
          }
          .events-table-row > span:nth-child(n+3) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── StatCard ────────────────────────────────────────────────────── */
function StatCard({ stat }: { stat: typeof MOCK_STATS[0] }) {
  const count = useAnimatedCount(stat.value);

  return (
    <div
      id={stat.id}
      style={{
        padding: '20px',
        background: '#121212',
        border: '1px solid #262626',
        borderRadius: '4px',
        transition: 'border-color 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#404040';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#262626';
      }}
    >
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '28px', fontWeight: 800,
        color: '#ffffff', lineHeight: 1,
        marginBottom: '8px', letterSpacing: '-0.02em',
      }}>
        {count.toLocaleString()}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', marginBottom: '2px' }}>
        {stat.label}
      </div>
      <div style={{ fontSize: '11px', color: '#737373' }}>
        {stat.sub}
      </div>
    </div>
  );
}

/* ─── QuickAction ────────────────────────────────────────────────── */
function QuickAction({ label, href }: { label: string; href?: string }) {
  const style: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    padding: '8px 16px', borderRadius: '4px',
    background: '#121212',
    border: '1px solid #262626',
    color: '#a3a3a3', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    textDecoration: 'none',
    transition: 'all 0.2s',
  };
  const hoverIn = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.borderColor = '#404040';
    (e.currentTarget as HTMLElement).style.color = '#ffffff';
  };
  const hoverOut = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.borderColor = '#262626';
    (e.currentTarget as HTMLElement).style.color = '#a3a3a3';
  };
  if (href) return (
    <Link to={href} style={style} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {label}
    </Link>
  );
  return (
    <button type="button" style={style} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {label}
    </button>
  );
}

/* ─── EventTableRow ──────────────────────────────────────────────── */
function EventTableRow({ event, index, total }: { event: EventRow; index: number; total: number }) {
  const pct = (event.registered / event.capacity) * 100;
  const st = statusConfig[event.status];
  const isLast = index === total - 1;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 100px 80px',
        padding: '14px 20px',
        gap: '12px',
        alignItems: 'center',
        borderBottom: isLast ? 'none' : '1px solid #262626',
        transition: 'background 0.2s',
      }}
      className="events-table-row"
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#171717'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      {/* Name + category */}
      <div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', margin: '0 0 3px' }}>
          {event.name}
        </p>
        <span style={{
          display: 'inline-block', padding: '2px 6px', borderRadius: '2px',
          fontSize: '10px', fontWeight: 600, color: '#a3a3a3',
          background: '#171717', border: '1px solid #262626',
        }}>
          {event.category}
        </span>
      </div>

      {/* Date */}
      <span style={{ fontSize: '12px', color: '#a3a3a3' }}>{event.date}</span>

      {/* Registrations + bar */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#e5e5e5', marginBottom: '4px' }}>
          {event.registered.toLocaleString()} / {event.capacity.toLocaleString()}
        </div>
        <div style={{
          width: '100%', height: '3px',
          background: '#262626',
          borderRadius: '99px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            borderRadius: '99px',
            background: '#E50914',
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Status */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '2px 8px', borderRadius: '4px',
        fontSize: '11px', fontWeight: 600,
        color: st.color, background: st.bg, border: `1px solid ${st.border}`,
        whiteSpace: 'nowrap',
      }}>
        {st.label}
      </span>

      {/* Actions */}
      <Link
        to={`/events/${event.id}`}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '5px 12px', borderRadius: '4px',
          fontSize: '12px', fontWeight: 600,
          color: '#ffffff', textDecoration: 'none',
          background: '#262626',
          border: '1px solid #404040',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = '#E50914';
          (e.currentTarget as HTMLElement).style.borderColor = '#E50914';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = '#262626';
          (e.currentTarget as HTMLElement).style.borderColor = '#404040';
        }}
      >
        View
      </Link>
    </div>
  );
}


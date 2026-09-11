import { Link } from 'react-router-dom';
import type { EventItem } from '../../../types/event';

interface EventCardProps {
  event: EventItem;
  animationDelay?: number;
}

export function EventCard({ event, animationDelay = 0 }: EventCardProps) {
  const seatsLeft = event.capacityTotal - event.capacityRegistered;
  const percentFull = (event.capacityRegistered / event.capacityTotal) * 100;
  const isFillingUp = seatsLeft < event.capacityTotal * 0.15;
  const isFull = seatsLeft === 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="animate-fade-in animate-slide-up"
      style={{
        textDecoration: 'none',
        display: 'block',
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both',
      }}
    >
      <article
        style={{
          background: '#121212',
          border: '1px solid #262626',
          borderRadius: '6px',
          overflow: 'hidden',
          transition: 'border-color 0.15s ease, transform 0.15s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-2px)';
          el.style.borderColor = '#404040';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(0)';
          el.style.borderColor = '#262626';
        }}
      >
        {/* Banner Area (Monochrome Dark) */}
        <div
          style={{
            height: '96px',
            background: '#171717',
            position: 'relative',
            flexShrink: 0,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid #222222',
          }}
        >
          {/* Category badge */}
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#a3a3a3',
            background: '#262626',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {event.category}
          </span>

          {/* Registered indicator */}
          {event.isRegistered && (
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#22c55e',
            }}>
              Registered
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flex: 1,
        }}>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.3,
            margin: 0,
          }}>
            {event.name}
          </h3>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <MetaChip label={event.date} />
            <MetaChip label={event.venue} />
          </div>

          {/* Description */}
          <p style={{
            fontSize: '13px',
            color: '#737373',
            lineHeight: 1.5,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {event.shortDescription}
          </p>

          {/* Capacity bar & Footer */}
          <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
            <div style={{
              width: '100%',
              height: '3px',
              background: '#262626',
              borderRadius: '99px',
              overflow: 'hidden',
              marginBottom: '10px',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentFull}%`,
                  background: isFull ? '#E50914' : isFillingUp ? '#eab308' : '#E50914',
                  borderRadius: '99px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {event.isRegistered ? (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>✓ Registered</span>
              ) : isFull ? (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#E50914' }}>Sold out</span>
              ) : isFillingUp ? (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#eab308' }}>{seatsLeft} seats left</span>
              ) : (
                <span style={{ fontSize: '12px', color: '#737373' }}>{seatsLeft} seats left</span>
              )}
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#E50914' }}>
                Details →
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 7px',
      borderRadius: '3px',
      fontSize: '11px',
      color: '#a3a3a3',
      background: '#171717',
      border: '1px solid #262626',
    }}>
      {label}
    </span>
  );
}
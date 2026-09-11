import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { EventItem } from '../types/event';
import { getEventById, registerForEvent } from '../features/events/api/eventsApi';

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;
    getEventById(id).then((data) => {
      setEvent(data ?? null);
      setLoading(false);
    });
  }, [id]);

  async function handleRegister() {
    if (!event) return;
    setRegistering(true);
    const result = await registerForEvent(event.id);
    if (result.success) {
      setEvent({ ...event, isRegistered: true, capacityRegistered: event.capacityRegistered + 1 });
      setJustRegistered(true);
    }
    setRegistering(false);
  }

  if (loading) return <LoadingSkeleton />;
  if (!event) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#ffffff', fontFamily: 'Outfit, sans-serif' }}>Event not found</h2>
        <Link to="/events" style={{
          display: 'inline-block', marginTop: '16px',
          padding: '8px 18px', borderRadius: '4px',
          background: '#E50914',
          color: 'white', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none',
        }}>← Back to events</Link>
      </div>
    </div>
  );

  const seatsLeft = event.capacityTotal - event.capacityRegistered;
  const percentFull = (event.capacityRegistered / event.capacityTotal) * 100;
  const isFull = seatsLeft === 0;
  const isFillingUp = seatsLeft < event.capacityTotal * 0.2;

  return (
    <div style={{ minHeight: '100vh', background: '#000000' }}>
      {/* ─── Minimal Hero Header ──────────────────────────────────── */}
      <div style={{
        background: '#141414',
        padding: '32px 24px 40px',
        borderBottom: '1px solid #1f1f1f',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <Link
            to="/events"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#a3a3a3', fontSize: '13px',
              textDecoration: 'none', fontWeight: 500,
              padding: '5px 12px', borderRadius: '4px',
              background: '#1c1c1c',
              border: '1px solid #262626',
              transition: 'all 0.15s ease',
              width: 'fit-content',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            All events
          </Link>

          <div>
            <span style={{
              display: 'inline-block',
              fontSize: '11px', fontWeight: 600,
              padding: '2px 8px', borderRadius: '4px',
              background: '#262626',
              border: '1px solid #333333',
              color: '#a3a3a3',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {event.category}
            </span>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              margin: 0,
            }}>
              {event.name}
            </h1>
          </div>
        </div>
      </div>

      {/* ─── Main Content ───────────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '24px',
        }}
          className="details-grid"
        >
          {/* Left — info */}
          <div className="animate-slide-up">
            {/* Meta chips */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '8px',
              marginBottom: '20px',
              padding: '16px',
              background: '#121212',
              border: '1px solid #262626',
              borderRadius: '6px',
            }}>
              <DetailChip label={event.date} />
              <DetailChip label={event.venue} />
              <DetailChip
                label={`${event.capacityRegistered} / ${event.capacityTotal} registered`}
              />
            </div>

            {/* Description card */}
            <div style={{
              padding: '24px',
              background: '#121212',
              border: '1px solid #262626',
              borderRadius: '6px',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '17px', fontWeight: 700,
                color: '#ffffff', marginBottom: '12px',
              }}>
                About this event
              </h2>
              <p style={{
                color: '#a3a3a3', lineHeight: 1.7, fontSize: '14px',
              }}>
                {event.fullDescription}
              </p>
            </div>
          </div>

          {/* Right — register sidebar */}
          <div className="animate-slide-up">
            <div style={{
              position: 'sticky',
              top: '80px',
              padding: '20px',
              background: '#121212',
              border: `1px solid ${event.isRegistered ? 'rgba(34,197,94,0.3)' : '#262626'}`,
              borderRadius: '6px',
            }}>
              {/* Capacity section */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '12px', color: '#737373', fontWeight: 500 }}>
                    Capacity
                  </span>
                  {isFull ? (
                    <span style={{ fontSize: '12px', color: '#E50914', fontWeight: 600 }}>Sold out</span>
                  ) : isFillingUp ? (
                    <span style={{ fontSize: '12px', color: '#eab308', fontWeight: 600 }}>{seatsLeft} left</span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#737373' }}>{seatsLeft} seats left</span>
                  )}
                </div>

                <div style={{
                  width: '100%', height: '4px',
                  background: '#262626',
                  borderRadius: '99px', overflow: 'hidden',
                  marginBottom: '6px',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentFull}%`,
                    background: isFull ? '#E50914' : isFillingUp ? '#eab308' : '#E50914',
                    borderRadius: '99px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '11px', color: '#737373',
                }}>
                  <span>{event.capacityRegistered} registered</span>
                  <span>{event.capacityTotal} total</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#222222', marginBottom: '16px' }} />

              {/* CTA */}
              {event.isRegistered ? (
                <div>
                  {justRegistered && (
                    <div style={{
                      marginBottom: '12px', padding: '10px',
                      borderRadius: '4px',
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      textAlign: 'center',
                      fontSize: '12px', color: '#22c55e', fontWeight: 500,
                    }}>
                      Registration confirmed
                    </div>
                  )}
                  <div style={{
                    padding: '14px',
                    borderRadius: '4px',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e', margin: '0 0 4px' }}>
                      ✓ You're registered!
                    </p>
                    <p style={{ fontSize: '12px', color: '#737373', margin: 0 }}>
                      Present your QR ticket under My Ticket
                    </p>
                  </div>
                  <Link
                    to="/ticket"
                    style={{
                      display: 'block', marginTop: '12px',
                      padding: '10px',
                      borderRadius: '4px',
                      background: '#E50914',
                      color: '#ffffff', fontSize: '13px', fontWeight: 600,
                      textAlign: 'center', textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    View My Ticket →
                  </Link>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit, sans-serif', marginBottom: '2px' }}>
                    Free Admission
                  </p>
                  <p style={{ fontSize: '12px', color: '#737373', marginBottom: '14px' }}>
                    College ID required at check-in
                  </p>
                  <button
                    id={`register-btn-${event.id}`}
                    onClick={handleRegister}
                    disabled={registering || isFull}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: registering || isFull ? 'not-allowed' : 'pointer',
                      background: isFull
                        ? '#262626'
                        : '#E50914',
                      color: isFull ? '#737373' : 'white',
                      fontSize: '14px',
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.15s ease',
                      opacity: isFull ? 0.6 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!registering && !isFull) {
                        (e.currentTarget as HTMLElement).style.background = '#B81D24';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!registering && !isFull) {
                        (e.currentTarget as HTMLElement).style.background = '#E50914';
                      }
                    }}
                  >
                    {registering ? 'Registering…' : isFull ? 'Fully Booked' : 'Register Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function DetailChip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 10px', borderRadius: '4px',
      fontSize: '12px', color: '#a3a3a3',
      background: '#171717',
      border: '1px solid #262626',
    }}>
      {label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#000000' }}>
      <div className="skeleton" style={{ height: '200px', borderRadius: 0 }} />
      <div style={{ maxWidth: '900px', margin: '24px auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          <div className="skeleton" style={{ height: '240px' }} />
          <div className="skeleton" style={{ height: '240px' }} />
        </div>
      </div>
    </div>
  );
}
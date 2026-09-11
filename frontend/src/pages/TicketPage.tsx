import { useEffect, useState } from 'react';
import type { Ticket } from '../types/ticket';
import { getTicket } from '../features/tickets/api/ticketsApi';
import { TicketCard } from '../features/tickets/components/TicketCard';

export default function TicketPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTicket('tkt_001').then((data) => {
      setTicket(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '4px 12px', borderRadius: '4px',
          background: '#121212',
          border: '1px solid #262626',
          fontSize: '11px', fontWeight: 600, color: '#E50914',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          My Pass
        </div>
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '26px', fontWeight: 800,
          color: '#ffffff', margin: 0, letterSpacing: '-0.02em',
        }}>
          Your Event Pass
        </h1>
        <p style={{ color: '#737373', fontSize: '14px', marginTop: '6px' }}>
          Present this QR code at the event entrance
        </p>
      </div>

      {/* Ticket */}
      {loading ? (
        <TicketSkeleton />
      ) : !ticket ? (
        <div style={{
          textAlign: 'center', padding: '48px 32px',
          background: '#121212',
          border: '1px solid #262626',
          borderRadius: '4px',
        }}>
          <p style={{ color: '#737373', fontSize: '14px', margin: 0 }}>No ticket found. Register for an event first.</p>
        </div>
      ) : (
        <TicketCard
          ticket={ticket}
          onTransferClick={() => alert('Transfer feature — coming soon!')}
        />
      )}

      {/* Hint */}
      {ticket && !loading && (
        <p style={{
          marginTop: '24px', fontSize: '12px', color: '#737373',
          textAlign: 'center',
        }}>
          Ticket Code · {ticket.ticketCode} · EventPulse Pass
        </p>
      )}
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div style={{
      width: '100%', maxWidth: '380px',
      borderRadius: '4px', overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ height: '140px', borderRadius: 0 }} />
      <div style={{
        padding: '24px',
        background: '#121212',
        border: '1px solid #262626',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <div className="skeleton" style={{ height: '180px' }} />
        <div className="skeleton" style={{ height: '32px', width: '60%', margin: '0 auto' }} />
        <div className="skeleton" style={{ height: '40px' }} />
      </div>
    </div>
  );
}
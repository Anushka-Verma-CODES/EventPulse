import type { Ticket } from '../../../types/ticket';
import { QRDisplay } from './QRDisplay';

interface TicketCardProps {
  ticket: Ticket;
  onTransferClick?: () => void;
}

const statusConfig: Record<
  Ticket['status'],
  { label: string; color: string; bg: string; border: string; dot: boolean }
> = {
  ISSUED: {
    label: 'Valid Pass',
    color: '#ffffff',
    bg: '#E50914',
    border: '#E50914',
    dot: false,
  },
  CHECKED_IN: {
    label: 'Checked In',
    color: '#e5e5e5',
    bg: 'rgba(255,255,255,0.06)',
    border: '#262626',
    dot: false,
  },
  TRANSFERRED: {
    label: 'Transferred',
    color: '#737373',
    bg: 'transparent',
    border: '#262626',
    dot: false,
  },
};

export function TicketCard({ ticket, onTransferClick }: TicketCardProps) {
  const status = statusConfig[ticket.status];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '380px',
        borderRadius: '6px',
        overflow: 'hidden',
        background: '#121212',
        border: '1px solid #262626',
        position: 'relative',
      }}
    >
      {/* Header — Netflix Red accent top border */}
      <div style={{
        background: '#171717',
        padding: '24px 24px 20px',
        position: 'relative',
        borderBottom: '1px solid #262626',
      }}>
        {/* Netflix Red Top Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px', background: '#E50914',
        }} />

        {/* Logo + Title */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', position: 'relative',
        }}>
          <div>
            <div style={{
              fontSize: '11px', fontWeight: 600,
              color: '#E50914',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              EventPulse Pass
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px', fontWeight: 700,
              color: '#ffffff', lineHeight: 1.2,
              margin: 0, letterSpacing: '-0.01em',
            }}>
              {ticket.eventName}
            </h2>
          </div>
          {/* Status badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 8px', borderRadius: '4px',
            background: status.bg, border: `1px solid ${status.border}`,
            fontSize: '11px', fontWeight: 600, color: status.color,
            flexShrink: 0,
          }}>
            {status.label}
          </span>
        </div>

        {/* Date + Venue */}
        <div style={{
          display: 'flex', gap: '16px', marginTop: '14px',
          position: 'relative', flexWrap: 'wrap',
        }}>
          <TicketMeta label={ticket.eventDate} />
          <TicketMeta label={ticket.venue} />
        </div>
      </div>

      {/* Dotted separator */}
      <div style={{
        height: '16px',
        position: 'relative',
        background: '#121212',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%', left: '16px', right: '16px',
          height: '1px',
          backgroundImage: 'repeating-linear-gradient(90deg, #262626 0, #262626 6px, transparent 6px, transparent 12px)',
        }} />
      </div>

      {/* QR Section */}
      <div style={{ padding: '0 24px 24px', position: 'relative' }}>
        {/* Holder info */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginBottom: '18px',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#737373', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>
              Ticket Holder
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{ticket.holderName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#737373', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>
              Category
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#E50914' }}>{ticket.category}</div>
          </div>
        </div>

        {/* QR Code */}
        <QRDisplay value={ticket.qrValue} size={150} />

        {/* Ticket code */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          marginBottom: '18px',
        }}>
          <span style={{
            fontFamily: 'Fira Code, monospace',
            fontSize: '12px',
            color: '#ffffff',
            letterSpacing: '0.12em',
            background: '#171717',
            padding: '5px 12px',
            borderRadius: '4px',
            border: '1px solid #262626',
          }}>
            {ticket.ticketCode}
          </span>
        </div>

        {/* Transfer button */}
        <button
          id={`transfer-ticket-${ticket.id}`}
          onClick={onTransferClick}
          disabled={ticket.status !== 'ISSUED'}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '4px',
            border: 'none',
            background: ticket.status === 'ISSUED' ? '#E50914' : '#171717',
            color: ticket.status === 'ISSUED' ? '#ffffff' : '#737373',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            cursor: ticket.status === 'ISSUED' ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: ticket.status === 'ISSUED' ? 1 : 0.5,
          }}
          onMouseEnter={e => {
            if (ticket.status === 'ISSUED') {
              (e.currentTarget as HTMLElement).style.background = '#B81D24';
            }
          }}
          onMouseLeave={e => {
            if (ticket.status === 'ISSUED') {
              (e.currentTarget as HTMLElement).style.background = '#E50914';
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Transfer Ticket
        </button>
      </div>
    </div>
  );
}

function TicketMeta({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: '12px', color: '#a3a3a3', fontWeight: 500,
    }}>
      {label}
    </span>
  );
}
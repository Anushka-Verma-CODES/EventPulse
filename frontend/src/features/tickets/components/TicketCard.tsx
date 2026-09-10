import type { Ticket } from '../../../types/ticket';
import { Badge } from '../../../components/ui/Badge';
import { QRDisplay } from './QRDisplay';

interface TicketCardProps {
  ticket: Ticket;
  onTransferClick?: () => void;
}

const statusVariant: Record<Ticket['status'], 'blue' | 'green' | 'gray'> = {
  ISSUED: 'blue',
  CHECKED_IN: 'green',
  TRANSFERRED: 'gray',
};

export function TicketCard({ ticket, onTransferClick }: TicketCardProps) {
  return (
    <div className="bg-gray-900 text-white rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-lg font-semibold">{ticket.eventName}</h2>
      <p className="text-sm text-gray-400 mb-5">
        {ticket.eventDate} · {ticket.venue}
      </p>

      <QRDisplay value={ticket.qrValue} />

      <p className="text-center text-xs text-gray-400 mt-4 mb-5 font-mono">
        {ticket.ticketCode}
      </p>

      <div className="flex justify-between items-center border-t border-gray-700 pt-4 mb-4">
        <span className="text-sm">{ticket.category}</span>
        <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
      </div>

      <button
        onClick={onTransferClick}
        disabled={ticket.status !== 'ISSUED'}
        className="w-full border border-gray-500 rounded py-2.5 text-sm font-medium
                   hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Transfer ticket
      </button>
    </div>
  );
}
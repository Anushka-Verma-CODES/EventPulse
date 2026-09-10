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

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading ticket…</div>;
  if (!ticket) return <div className="text-center mt-10 text-red-500">Ticket not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <TicketCard
        ticket={ticket}
        onTransferClick={() => alert('Transfer modal goes here — next feature to build')}
      />
    </div>
  );
}
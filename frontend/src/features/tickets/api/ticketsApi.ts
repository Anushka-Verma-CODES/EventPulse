import type { Ticket } from '../../../types/ticket';
const MOCK_TICKET: Ticket = {
  id: 'tkt_001',
  ticketCode: 'EP-24601-A',
  qrValue: 'ep-signed-token::tkt_001::event_ascend2026',
  eventName: 'Ascend — Tech Fest',
  eventDate: 'Sat, 21 Mar 2026',
  venue: 'Main Campus',
  category: 'Student Pass',
  status: 'ISSUED',
  holderName: 'Rohan Mehta',
};

export async function getTicket(ticketId: string): Promise<Ticket> {
  // simulates network latency so components handle loading state correctly
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ...MOCK_TICKET, id: ticketId };
}
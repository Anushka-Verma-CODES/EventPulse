export type TicketStatus = 'ISSUED' | 'CHECKED_IN' | 'TRANSFERRED';

export interface Ticket {
  id: string;
  ticketCode: string;       // e.g. "EP-24601-A" — human-readable
  qrValue: string;           // the signed token string encoded into the QR
  eventName: string;
  eventDate: string;
  venue: string;
  category: string;          // "Student Pass" | "General" etc.
  status: TicketStatus;
  holderName: string;
}
export const mockScannerUser = {
  name: "Amit Kumar",
  role: "Gate Staff",
  initials: "AK",
};

export interface ScannerEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
}

export const scannerEvents: ScannerEvent[] = [
  { id: "tech-fest-2026", name: "Tech Fest 2026", date: "18 Sept 2026", venue: "TIET" },
  { id: "dev-workshop", name: "Developer Workshop", date: "22 Sept 2026", venue: "TIET" },
];

export interface ScannerGate {
  id: string;
  name: string;
  description: string;
  entries: number;
  status: "Normal" | "Busy";
}

export const gatesByEvent: Record<string, ScannerGate[]> = {
  "tech-fest-2026": [
    { id: "gate-1", name: "Gate 1", description: "Main Entrance", entries: 412, status: "Normal" },
    { id: "gate-2", name: "Gate 2", description: "North Entrance", entries: 631, status: "Busy" },
    { id: "gate-3", name: "Gate 3", description: "East Entrance", entries: 202, status: "Normal" },
  ],
  "dev-workshop": [
    { id: "gate-1", name: "Gate 1", description: "Main Entrance", entries: 58, status: "Normal" },
  ],
};

type TicketStatus = "active" | "checked_in" | "transferred" | "expired";

interface MockTicket {
  id: string;
  attendeeName: string;
  ticketType: string;
  eventId: string;
  eventName: string;
  status: TicketStatus;
  checkedInAt: string | null;
  checkedInGate: string | null;
}

// Module-level mock "database" — mutated as tickets get scanned, so
// scanning the same code twice in a session correctly shows "Duplicate".
const tickets: MockTicket[] = [
  {
    id: "TKT-1001",
    attendeeName: "Rajat Sharma",
    ticketType: "General Entry",
    eventId: "tech-fest-2026",
    eventName: "Tech Fest 2026",
    status: "active",
    checkedInAt: null,
    checkedInGate: null,
  },
  {
    id: "TKT-1002",
    attendeeName: "Aman Kumar",
    ticketType: "General Entry",
    eventId: "tech-fest-2026",
    eventName: "Tech Fest 2026",
    status: "active",
    checkedInAt: null,
    checkedInGate: null,
  },
  {
    id: "TKT-1003",
    attendeeName: "Priya Sharma",
    ticketType: "VIP",
    eventId: "tech-fest-2026",
    eventName: "Tech Fest 2026",
    status: "checked_in",
    checkedInAt: "10:14 AM",
    checkedInGate: "Gate 1",
  },
  {
    id: "TKT-1004",
    attendeeName: "Anushka Verma",
    ticketType: "General Entry",
    eventId: "tech-fest-2026",
    eventName: "Tech Fest 2026",
    status: "active",
    checkedInAt: null,
    checkedInGate: null,
  },
  {
    id: "TKT-2001",
    attendeeName: "Neha Verma",
    ticketType: "General Entry",
    eventId: "dev-workshop",
    eventName: "Developer Workshop",
    status: "active",
    checkedInAt: null,
    checkedInGate: null,
  },
  {
    id: "TKT-3001",
    attendeeName: "Karan Mehta",
    ticketType: "General Entry",
    eventId: "tech-fest-2026",
    eventName: "Tech Fest 2026",
    status: "expired",
    checkedInAt: null,
    checkedInGate: null,
  },
  {
    id: "TKT-4001",
    attendeeName: "Sana Khan",
    ticketType: "General Entry",
    eventId: "tech-fest-2026",
    eventName: "Tech Fest 2026",
    status: "transferred",
    checkedInAt: null,
    checkedInGate: null,
  },
];

export type ScanResultType =
  | "valid"
  | "duplicate"
  | "invalid"
  | "wrong_event"
  | "expired"
  | "transferred";

export interface ScanResult {
  type: ScanResultType;
  ticketId: string;
  attendeeName?: string;
  ticketType?: string;
  eventName?: string;
  gate?: string;
  checkedInAt?: string;
  previousGate?: string;
  expectedEventName?: string;
}

export interface ScanHistoryEntry {
  ticketId: string;
  attendeeName: string;
  time: string;
  result: ScanResultType;
}

export const scanHistory: ScanHistoryEntry[] = [];

function currentTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

function recordHistory(ticketId: string, attendeeName: string, result: ScanResultType) {
  scanHistory.unshift({ ticketId, attendeeName, time: currentTimeLabel(), result });
}

// Mock validation — a real implementation sends the ticket code to the
// backend (POST /tickets/validate) and lets it check the database.
// This mimics that response shape so swapping it out later is a
// drop-in replacement rather than a rewrite of every scanner page.
export function validateTicket(rawCode: string, eventId: string, eventName: string, gateName: string): ScanResult {
  const ticketId = rawCode.trim().toUpperCase();
  const ticket = tickets.find((t) => t.id === ticketId);

  if (!ticket) {
    recordHistory(ticketId, "Unknown", "invalid");
    return { type: "invalid", ticketId };
  }

  if (ticket.eventId !== eventId) {
    recordHistory(ticketId, ticket.attendeeName, "wrong_event");
    return { type: "wrong_event", ticketId, expectedEventName: eventName };
  }

  if (ticket.status === "expired") {
    recordHistory(ticketId, ticket.attendeeName, "expired");
    return { type: "expired", ticketId, eventName: ticket.eventName };
  }

  if (ticket.status === "transferred") {
    recordHistory(ticketId, ticket.attendeeName, "transferred");
    return { type: "transferred", ticketId };
  }

  if (ticket.status === "checked_in") {
    recordHistory(ticketId, ticket.attendeeName, "duplicate");
    return {
      type: "duplicate",
      ticketId,
      attendeeName: ticket.attendeeName,
      ticketType: ticket.ticketType,
      checkedInAt: ticket.checkedInAt ?? undefined,
      previousGate: ticket.checkedInGate ?? undefined,
    };
  }

  // active -> mark as checked in
  const time = currentTimeLabel();
  ticket.status = "checked_in";
  ticket.checkedInAt = time;
  ticket.checkedInGate = gateName;
  recordHistory(ticketId, ticket.attendeeName, "valid");

  return {
    type: "valid",
    ticketId,
    attendeeName: ticket.attendeeName,
    ticketType: ticket.ticketType,
    eventName: ticket.eventName,
    gate: gateName,
    checkedInAt: time,
  };
}

export type GateStatus = "Normal" | "Busy";

export interface ScannerGate {
  id: string;
  name: string;
  label: string;
  entries: number;
  status: GateStatus;
}

export interface ScannerEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  gates: ScannerGate[];
}

export type TicketStatus = "unused" | "used" | "expired" | "transferred";

export interface ScannerTicket {
  attendee: string;
  type: string;
  eventId: string;
  status: TicketStatus;
  checkedInGate?: string;
  checkedInTime?: string;
}

export type ScanResultType =
  | "valid"
  | "duplicate"
  | "invalid"
  | "wrongEvent"
  | "expired"
  | "transferred";

export interface ScanResult {
  type: ScanResultType;
  code: string;
  ticket?: ScannerTicket;
  ticketEventName?: string;
  time?: string;
}

export interface ScanHistoryEntry {
  code: string;
  attendee: string;
  time: string;
  result: "valid" | "duplicate" | "invalid" | "rejected";
}

export interface ScannerStaff {
  name: string;
  role: string;
}

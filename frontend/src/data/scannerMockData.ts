import type {
  ScannerEvent,
  ScannerTicket,
  ScannerStaff,
  ScanHistoryEntry,
} from "../types/scanner";

// TODO: replace with the logged-in user from your auth context
export const SCANNER_STAFF: ScannerStaff = {
  name: "Rajat Sharma",
  role: "Gate Staff",
};

// TODO: replace with GET /events (scoped to events this staff member is assigned to)
export const SCANNER_EVENTS: ScannerEvent[] = [
  {
    id: "techfest",
    name: "Tech Fest 2026",
    date: "18 Sept 2026",
    venue: "Main Auditorium",
    gates: [
      { id: "gate1", name: "Gate 1", label: "Main Entrance", entries: 412, status: "Normal" },
      { id: "gate2", name: "Gate 2", label: "North Entrance", entries: 631, status: "Busy" },
      { id: "gate3", name: "Gate 3", label: "East Entrance", entries: 202, status: "Normal" },
    ],
  },
  {
    id: "workshop",
    name: "Developer Workshop",
    date: "22 Sept 2026",
    venue: "Innovation Centre",
    gates: [
      { id: "gate1", name: "Gate 1", label: "Main Entrance", entries: 58, status: "Normal" },
    ],
  },
];

// TODO: replace with GET /tickets (or validate one-by-one via POST /tickets/validate)
// Keyed by ticket code so lookups in scanTicket() are O(1).
export const SCANNER_TICKETS: Record<string, ScannerTicket> = {
  "TKT-1001": { attendee: "Rajat Sharma", type: "General Entry", eventId: "techfest", status: "unused" },
  "TKT-1002": { attendee: "Aman Kumar", type: "General Entry", eventId: "techfest", status: "unused" },
  "TKT-1003": {
    attendee: "Priya Sharma",
    type: "VIP Entry",
    eventId: "techfest",
    status: "used",
    checkedInGate: "Gate 1",
    checkedInTime: "10:14 AM",
  },
  "TKT-1004": { attendee: "Anushka Verma", type: "General Entry", eventId: "techfest", status: "unused" },
  "TKT-1005": { attendee: "Rohan Gupta", type: "General Entry", eventId: "techfest", status: "transferred" },
  "TKT-3001": { attendee: "Simran Kaur", type: "General Entry", eventId: "techfest", status: "expired" },
  "TKT-2001": { attendee: "Karan Mehta", type: "Workshop Pass", eventId: "workshop", status: "unused" },
};

export const SCANNER_HISTORY_SEED: ScanHistoryEntry[] = [
  { code: "TKT-1090", attendee: "Neha Bhatt", time: "10:02 AM", result: "valid" },
  { code: "TKT-1091", attendee: "Vikram Rao", time: "10:06 AM", result: "valid" },
  { code: "TKT-8888", attendee: "Unknown", time: "10:09 AM", result: "invalid" },
];

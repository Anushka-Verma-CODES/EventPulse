import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  SCANNER_EVENTS,
  SCANNER_HISTORY_SEED,
  SCANNER_TICKETS,
  SCANNER_STAFF,
} from "../data/scannerMockData";
import type {
  ScanHistoryEntry,
  ScanResult,
  ScannerEvent,
  ScannerGate,
  ScannerStaff,
  ScannerTicket,
} from "../types/scanner";

function nowShort() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function nowFull() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

interface ScannerContextValue {
  staff: ScannerStaff;
  events: ScannerEvent[];
  selectedEvent: ScannerEvent | null;
  selectedGate: ScannerGate | null;
  history: ScanHistoryEntry[];
  lastResult: ScanResult | null;
  selectEvent: (eventId: string) => void;
  selectGate: (gateId: string) => void;
  scanTicket: (rawCode: string) => ScanResult;
  clearResult: () => void;
}

const ScannerContext = createContext<ScannerContextValue | undefined>(undefined);

export function ScannerProvider({ children }: { children: React.ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<ScannerEvent | null>(null);
  const [selectedGate, setSelectedGate] = useState<ScannerGate | null>(null);
  const [tickets, setTickets] = useState<Record<string, ScannerTicket>>(SCANNER_TICKETS);
  const [history, setHistory] = useState<ScanHistoryEntry[]>(SCANNER_HISTORY_SEED);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);

  const selectEvent = useCallback((eventId: string) => {
    const event = SCANNER_EVENTS.find((e) => e.id === eventId) ?? null;
    setSelectedEvent(event);
    setSelectedGate(null);
  }, []);

  const selectGate = useCallback(
    (gateId: string) => {
      const gate = selectedEvent?.gates.find((g) => g.id === gateId) ?? null;
      setSelectedGate(gate);
    },
    [selectedEvent]
  );

  // TODO: replace this whole function with:
  //   const res = await api.post('/tickets/validate', { code, eventId, gateId });
  //   setLastResult(res.data);
  const scanTicket = useCallback(
    (rawCode: string): ScanResult => {
      const code = rawCode.trim().toUpperCase();
      const ticket = tickets[code];
      let result: ScanResult;
      let historyResult: ScanHistoryEntry["result"];

      if (!selectedEvent || !selectedGate) {
        result = { type: "invalid", code };
        historyResult = "invalid";
      } else if (!ticket) {
        result = { type: "invalid", code };
        historyResult = "invalid";
      } else if (ticket.eventId !== selectedEvent.id) {
        const ticketEventName = SCANNER_EVENTS.find((e) => e.id === ticket.eventId)?.name ?? "another event";
        result = { type: "wrongEvent", code, ticketEventName };
        historyResult = "rejected";
      } else if (ticket.status === "expired") {
        result = { type: "expired", code, ticket };
        historyResult = "rejected";
      } else if (ticket.status === "transferred") {
        result = { type: "transferred", code, ticket };
        historyResult = "rejected";
      } else if (ticket.status === "used") {
        result = { type: "duplicate", code, ticket };
        historyResult = "duplicate";
      } else {
        const updated: ScannerTicket = {
          ...ticket,
          status: "used",
          checkedInGate: selectedGate.name,
          checkedInTime: nowShort(),
        };
        setTickets((t) => ({ ...t, [code]: updated }));
        result = { type: "valid", code, ticket: updated, time: nowFull() };
        historyResult = "valid";
      }

      setHistory((h) => [
        { code, attendee: ticket?.attendee ?? "Unknown", time: nowShort(), result: historyResult },
        ...h,
      ]);
      setLastResult(result);
      return result;
    },
    [tickets, selectedEvent, selectedGate]
  );

  const clearResult = useCallback(() => setLastResult(null), []);

  const value = useMemo(
    () => ({
      staff: SCANNER_STAFF,
      events: SCANNER_EVENTS,
      selectedEvent,
      selectedGate,
      history,
      lastResult,
      selectEvent,
      selectGate,
      scanTicket,
      clearResult,
    }),
    [selectedEvent, selectedGate, history, lastResult, selectEvent, selectGate, scanTicket, clearResult]
  );

  return <ScannerContext.Provider value={value}>{children}</ScannerContext.Provider>;
}

export function useScanner() {
  const ctx = useContext(ScannerContext);
  if (!ctx) throw new Error("useScanner must be used within a ScannerProvider");
  return ctx;
}

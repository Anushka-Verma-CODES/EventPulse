import { useEffect, useMemo, useState } from "react";
import { History, Keyboard, Zap, ZapOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ScannerTopBar } from "../../components/scanner/ScannerTopBar";
import { ScannerCameraFrame } from "../../components/scanner/ScannerCameraFrame";
import { ManualCodeEntry } from "../../components/scanner/ManualCodeEntry";
import { ScannerStatBar } from "../../components/scanner/ScannerStatBar";
import { useScanner } from "../../context/ScannerContext";
import { SCANNER_TICKETS } from "../../data/scannerMockData";
import type { ScanResultType } from "../../types/scanner";

const DEMO_CHIPS: { key: ScanResultType; label: string; className: string }[] = [
  { key: "valid", label: "Valid ticket", className: "text-green-600" },
  { key: "duplicate", label: "Already used", className: "text-red-600" },
  { key: "invalid", label: "Invalid", className: "text-red-600" },
  { key: "wrongEvent", label: "Wrong event", className: "text-amber-600" },
  { key: "expired", label: "Expired", className: "text-amber-600" },
  { key: "transferred", label: "Transferred", className: "text-red-600" },
];

export function QRScannerPage() {
  const { eventId, gateId } = useParams<{ eventId: string; gateId: string }>();
  const { selectedEvent, selectedGate, selectEvent, selectGate, history, scanTicket } = useScanner();
  const navigate = useNavigate();
  const [flash, setFlash] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    if (eventId && selectedEvent?.id !== eventId) selectEvent(eventId);
  }, [eventId, selectedEvent, selectEvent]);
  useEffect(() => {
    if (gateId && selectedGate?.id !== gateId) selectGate(gateId);
  }, [gateId, selectedGate, selectGate]);

  const event = selectedEvent;
  const gate = selectedGate;

  // Finds a real mock ticket code for each demo scenario, scoped to the current event
  // so tapping a chip exercises the same scanTicket() path a real scan would.
  const demoCodes = useMemo(() => {
    if (!event) return {} as Record<ScanResultType, string | undefined>;
    const entries = Object.entries(SCANNER_TICKETS);
    const find = (pred: (t: (typeof entries)[number][1]) => boolean, sameEvent = true) =>
      entries.find(([, t]) => pred(t) && (!sameEvent || t.eventId === event.id))?.[0];

    return {
      valid: find((t) => t.status === "unused"),
      duplicate: find((t) => t.status === "used"),
      expired: find((t) => t.status === "expired"),
      transferred: find((t) => t.status === "transferred"),
      wrongEvent: entries.find(([, t]) => t.eventId !== event.id)?.[0],
      invalid: "TKT-9999",
    } as Record<ScanResultType, string | undefined>;
  }, [event]);

  if (!event || !gate) return null;

  const handleScan = (code: string) => {
    scanTicket(code);
    navigate("/scanner/result");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <ScannerTopBar
        title={event.name}
        subtitle={`${gate.name} \u00b7 Scanner active`}
        onBack={() => navigate(`/scanner/event/${event.id}`)}
        right={
          <button
            onClick={() => navigate("/scanner/history")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Scan history"
          >
            <History className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex-1 space-y-4 px-4 py-5 sm:px-6">
        <ScannerCameraFrame active={!manualOpen} />
        <p className="text-center text-sm text-gray-500">Point the attendee's QR code inside the frame</p>

        <div className="flex gap-2">
          <button
            onClick={() => setFlash((f) => !f)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {flash ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {flash ? "Flash on" : "Flash"}
          </button>
          <button
            onClick={() => setManualOpen((v) => !v)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Keyboard className="h-4 w-4" />
            Enter code
          </button>
        </div>

        {manualOpen && <ManualCodeEntry onSubmit={handleScan} />}

        <div className="border-t border-gray-200 pt-4">
          <div className="mb-2.5 text-xs text-gray-400">Demo &mdash; simulate a scan result</div>
          <div className="flex flex-wrap gap-2">
            {DEMO_CHIPS.map((chip) => {
              const code = demoCodes[chip.key];
              return (
                <button
                  key={chip.key}
                  disabled={!code}
                  onClick={() => code && handleScan(code)}
                  className={`rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 ${chip.className}`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ScannerStatBar history={history} gateName={gate.name} />
    </div>
  );
}

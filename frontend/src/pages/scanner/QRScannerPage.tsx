import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import QRScanner from "../../components/scanner/QRScanner";
import ManualTicketInput from "../../components/scanner/ManualTicketInput";
import ScanResultCard from "../../components/scanner/ScanResultCard";
import { scannerEvents, gatesByEvent, validateTicket } from "../../lib/scannerMockData";
import type { ScanResult } from "../../lib/scannerMockData";

export default function QRScannerPage() {
  const { eventId, gateId } = useParams();
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [result, setResult] = useState<ScanResult | null>(null);

  const event = scannerEvents.find((e) => e.id === eventId);
  const gate = eventId ? gatesByEvent[eventId]?.find((g) => g.id === gateId) : undefined;

  if (!event || !gate) return <Navigate to="/scanner" replace />;

  function handleCode(code: string) {
    if (!event || !gate) return;
    setResult(validateTicket(code, event.id, event.name, gate.name));
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Link to={`/scanner/event/${event.id}`} className="text-sm font-medium text-[#2563EB] hover:underline">
          &larr; Back
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A]" /> Scanner Active
        </span>
      </div>

      <div className="mt-2 text-center">
        <h2 className="text-xl font-bold text-[#1E293B]">{event.name}</h2>
        <p className="text-sm text-[#64748B]">{gate.name}</p>
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center">
        {result ? (
          <ScanResultCard result={result} onScanNext={() => setResult(null)} />
        ) : mode === "camera" ? (
          <>
            <QRScanner onScan={handleCode} />
            <p className="mt-4 text-base text-[#64748B]">Scan attendee QR code</p>
            <p className="text-sm text-[#94A3B8]">Keep the QR code inside the frame</p>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className="mt-5 w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white py-3.5 text-base font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              Enter Ticket Code
            </button>
          </>
        ) : (
          <ManualTicketInput onSubmit={handleCode} onCancel={() => setMode("camera")} />
        )}
      </div>

      {!result && (
        <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4 text-sm text-[#64748B]">
          <span>Today: 1,245 checked in</span>
          <span>Gate: {gate.status}</span>
        </div>
      )}
    </div>
  );
}

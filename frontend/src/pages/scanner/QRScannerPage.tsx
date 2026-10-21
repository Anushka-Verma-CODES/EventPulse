import { useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import QRScanner from "../../components/scanner/QRScanner";
import ManualTicketInput from "../../components/scanner/ManualTicketInput";
import ScanResultCard from "../../components/scanner/ScanResultCard";
import { scannerEvents, gatesByEvent } from "../../lib/scannerMockData";
import type { ScanResult } from "../../lib/scannerMockData";
import { checkInTicket } from "../../features/checkin/api/checkinApi";

export default function QRScannerPage() {
  const { eventId, gateId } = useParams();
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkingRef = useRef(false);

  const event = scannerEvents.find((e) => e.id === eventId);
  const gate = eventId
    ? gatesByEvent[eventId]?.find((g) => g.id === gateId)
    : undefined;

  if (!event || !gate) {
    return <Navigate to="/scanner" replace />;
  }

  async function handleCode(code: string) {
    if (checkingRef.current || result) return;

    checkingRef.current = true;
    setIsChecking(true);
    setErrorMessage(null);

    try {
      const response = await checkInTicket(code.trim());

      setResult({
        type: "valid",
        ticketId: response.registrationId,
        eventName: response.eventName,
        gate: gate.name,
        checkedInAt: new Date(response.checkedInAt).toLocaleTimeString(
          "en-IN",
          {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          },
        ),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to validate this ticket.";

      setErrorMessage(message);

      setResult({
        type: message.toLowerCase().includes("already been used")
          ? "duplicate"
          : "invalid",
        ticketId: code.trim(),
      });
    } finally {
      checkingRef.current = false;
      setIsChecking(false);
    }
  }

  function handleScanNext() {
    setResult(null);
    setErrorMessage(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Link
          to={`/scanner/event/${event.id}`}
          className="text-sm font-medium text-[#2563EB] hover:underline"
        >
          &larr; Back
        </Link>

        <span className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A]" />
          Scanner Active
        </span>
      </div>

      <div className="mt-2 text-center">
        <h2 className="text-xl font-bold text-[#1E293B]">
          {event.name}
        </h2>
        <p className="text-sm text-[#64748B]">{gate.name}</p>
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center">
        {result ? (
          <>
            {errorMessage && (
              <p className="mb-3 w-full max-w-sm rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <ScanResultCard
              result={result}
              onScanNext={handleScanNext}
            />
          </>
        ) : mode === "camera" ? (
          <>
            <QRScanner onScan={handleCode} />

            <p className="mt-4 text-base text-[#64748B]">
              {isChecking
                ? "Validating ticket..."
                : "Scan attendee QR code"}
            </p>

            <p className="text-sm text-[#94A3B8]">
              Keep the QR code inside the frame
            </p>

            <button
              type="button"
              disabled={isChecking}
              onClick={() => setMode("manual")}
              className="mt-5 w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white py-3.5 text-base font-medium text-[#1E293B] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Enter Ticket Code
            </button>
          </>
        ) : (
          <>
            {isChecking && (
              <p className="mb-3 text-sm text-[#64748B]">
                Validating ticket...
              </p>
            )}

            <ManualTicketInput
              onSubmit={handleCode}
              onCancel={() => setMode("camera")}
            />
          </>
        )}
      </div>

      {!result && (
        <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4 text-sm text-[#64748B]">
          <span>Live check-in enabled</span>
          <span>Gate: {gate.status}</span>
        </div>
      )}
    </div>
  );
}

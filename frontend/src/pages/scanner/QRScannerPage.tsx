
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import QRScanner from "../../components/scanner/QRScanner";
import ManualTicketInput from "../../components/scanner/ManualTicketInput";
import ScanResultCard from "../../components/scanner/ScanResultCard";

import type { ScanResult } from "../../lib/scannerMockData";

import { checkInTicket } from "../../features/checkin/api/checkinApi";

import {
  getEventById,
  getMyScannerAssignments,
} from "../../features/events/api/eventsApi";

import type {
  ScannerEventAssignment,
} from "../../features/events/api/eventsApi";

import type { EventItem } from "../../types/event";

export default function QRScannerPage() {
  const { eventId, gateId } = useParams<{
    eventId: string;
    gateId: string;
  }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [assignment, setAssignment] =
    useState<ScannerEventAssignment | null>(null);

  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState("");

  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadScannerDetails() {
      if (!eventId || !gateId) {
        setLoadingEvent(false);
        return;
      }

      try {
        setLoadingEvent(true);
        setEventError("");

        const assignments = await getMyScannerAssignments();

        const currentAssignment = assignments.find(
          (item) =>
            item.eventId === eventId &&
            item.gateId === gateId &&
            item.gate?.id === gateId,
        );

        if (!currentAssignment) {
          throw new Error(
            "You are not assigned to this event and gate. Contact the organizer.",
          );
        }

        const eventData = await getEventById(eventId);

        if (!eventData) {
          throw new Error("Event not found.");
        }

        if (!cancelled) {
          setAssignment(currentAssignment);
          setEvent(eventData);
        }
      } catch (error) {
        if (!cancelled) {
          setAssignment(null);
          setEvent(null);

          setEventError(
            error instanceof Error
              ? error.message
              : "Unable to load scanner assignment.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEvent(false);
        }
      }
    }

    void loadScannerDetails();

    return () => {
      cancelled = true;
    };
  }, [eventId, gateId]);

  if (!eventId || !gateId) {
    return <Navigate to="/scanner" replace />;
  }

  if (loadingEvent) {
    return (
      <div className="p-4 text-sm text-[#64748B]">
        Loading scanner assignment...
      </div>
    );
  }

  if (!event && !eventError) {
    return <Navigate to="/scanner" replace />;
  }

  async function handleCode(code: string) {
    if (
      checkingRef.current ||
      result ||
      !event ||
      !assignment?.gate
    ) {
      return;
    }

    checkingRef.current = true;
    setIsChecking(true);
    setErrorMessage(null);

    try {
      // The backend uses the authenticated scanner's active gate assignment.
      const response = await checkInTicket(code.trim(), event.id);

      if (response.eventId !== event.id) {
        setResult({
          type: "wrong_event",
          ticketId: code.trim(),
          expectedEventName: event.name,
        });

        setErrorMessage("This ticket belongs to a different event.");
        return;
      }

      setResult({
        type: "valid",
        ticketId: response.ticketId,
        eventName: response.eventName,
        gate: assignment.gate.name,
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

      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes(
          "does not belong to the selected event",
        )
      ) {
        setResult({
          type: "wrong_event",
          ticketId: code.trim(),
          expectedEventName: event.name,
        });
      } else {
        setResult({
          type: normalizedMessage.includes("already been used")
            ? "duplicate"
            : "invalid",
          ticketId: code.trim(),
        });
      }
    } finally {
      checkingRef.current = false;
      setIsChecking(false);
    }
  }

  function handleScanNext() {
    setResult(null);
    setErrorMessage(null);
  }

  if (eventError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{eventError}</p>

        <Link
          to="/scanner"
          className="mt-3 inline-block font-semibold underline"
        >
          Back to events
        </Link>
      </div>
    );
  }

  if (!event || !assignment?.gate) {
    return <Navigate to="/scanner" replace />;
  }

  const gateName = assignment.gate.name;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <Link
          to={`/scanner/event/${eventId}`}
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

        <p className="text-sm text-[#64748B]">
          {gateName} · {assignment.gate.code}
        </p>
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
              Enter Ticket ID
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
          <span>Station: {gateName}</span>
        </div>
      )}
    </div>
  );
}

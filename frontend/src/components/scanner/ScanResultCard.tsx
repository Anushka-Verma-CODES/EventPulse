import { useEffect, useState } from "react";
import type { ScanResult } from "../../lib/scannerMockData";

interface ScanResultCardProps {
  result: ScanResult;
  onScanNext: () => void;
}

const config: Record<
  ScanResult["type"],
  { icon: string; tone: "success" | "error"; heading: string; subheading: string }
> = {
  valid: { icon: "\u2713", tone: "success", heading: "Ticket Valid", subheading: "Entry Approved" },
  duplicate: {
    icon: "\u2715",
    tone: "error",
    heading: "Ticket Already Used",
    subheading: "Entry Rejected",
  },
  invalid: {
    icon: "\u2715",
    tone: "error",
    heading: "Invalid Ticket",
    subheading: "Entry Rejected",
  },
  wrong_event: {
    icon: "!",
    tone: "error",
    heading: "Wrong Event",
    subheading: "This ticket belongs to another event.",
  },
  expired: {
    icon: "!",
    tone: "error",
    heading: "Ticket Expired",
    subheading: "This ticket is no longer valid.",
  },
  transferred: {
    icon: "\u2715",
    tone: "error",
    heading: "Ticket No Longer Valid",
    subheading: "This ticket has been transferred to another attendee.",
  },
};

const toneStyles = {
  success: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", ring: "border-[#BBF7D0]" },
  error: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", ring: "border-[#FECACA]" },
};

export default function ScanResultCard({ result, onScanNext }: ScanResultCardProps) {
  const meta = config[result.type];
  const tone = toneStyles[meta.tone];
  const [secondsLeft, setSecondsLeft] = useState(result.type === "valid" ? 4 : 0);

  // Only auto-advance on a clean valid scan — rejections stay on screen
  // until staff dismiss them, since they may need a moment to explain
  // the issue to the attendee.
  useEffect(() => {
    if (result.type !== "valid") return;
    if (secondsLeft <= 0) {
      onScanNext();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [result.type, secondsLeft, onScanNext]);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className={`rounded-xl border ${tone.ring} ${tone.bg} p-8 text-center`}>
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl font-bold ${tone.text}`}
        >
          {meta.icon}
        </div>
        <h3 className="mt-4 text-2xl font-bold text-[#1E293B]">{meta.heading}</h3>
        <p className="mt-1 text-base text-[#64748B]">{meta.subheading}</p>
      </div>

      <div className="rounded-b-xl border border-t-0 border-[#E2E8F0] bg-white p-5 text-sm">
        {result.type === "valid" && (
          <>
            <div className="text-xs text-[#64748B]">{result.eventName}</div>
            <div className="mt-2 font-semibold text-[#1E293B]">{result.attendeeName}</div>
            <div className="text-[#64748B]">{result.ticketType}</div>
            <div className="mt-3 flex justify-between border-t border-[#E2E8F0] pt-3">
              <span className="text-[#64748B]">Ticket ID</span>
              <span className="font-medium text-[#1E293B]">{result.ticketId}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-[#64748B]">Gate</span>
              <span className="font-medium text-[#1E293B]">{result.gate}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-[#64748B]">Checked in</span>
              <span className="font-medium text-[#1E293B]">{result.checkedInAt}</span>
            </div>
          </>
        )}

        {result.type === "duplicate" && (
          <>
            <div className="font-semibold text-[#1E293B]">{result.attendeeName}</div>
            <div className="text-[#64748B]">{result.ticketType}</div>
            <div className="mt-3 flex justify-between border-t border-[#E2E8F0] pt-3">
              <span className="text-[#64748B]">Ticket ID</span>
              <span className="font-medium text-[#1E293B]">{result.ticketId}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-[#64748B]">Checked in at</span>
              <span className="font-medium text-[#1E293B]">{result.checkedInAt}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-[#64748B]">Previous Gate</span>
              <span className="font-medium text-[#1E293B]">{result.previousGate}</span>
            </div>
          </>
        )}

        {result.type === "invalid" && (
          <>
            <p className="text-[#64748B]">This ticket could not be verified.</p>
            <div className="mt-3 flex justify-between border-t border-[#E2E8F0] pt-3">
              <span className="text-[#64748B]">Ticket ID</span>
              <span className="font-medium text-[#1E293B]">{result.ticketId}</span>
            </div>
          </>
        )}

        {result.type === "wrong_event" && (
          <>
            <div className="mt-1 flex justify-between">
              <span className="text-[#64748B]">Ticket</span>
              <span className="font-medium text-[#1E293B]">{result.ticketId}</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-[#64748B]">Expected</span>
              <span className="font-medium text-[#1E293B]">{result.expectedEventName}</span>
            </div>
          </>
        )}

        {result.type === "expired" && (
          <div className="flex justify-between">
            <span className="text-[#64748B]">Event</span>
            <span className="font-medium text-[#1E293B]">{result.eventName}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onScanNext}
        className="mt-4 w-full rounded-lg bg-[#2563EB] py-4 text-base font-medium text-white hover:bg-[#1D4ED8]"
      >
        {result.type === "valid"
          ? `Scan Next Ticket (${secondsLeft}s)`
          : "Scan Again"}
      </button>
    </div>
  );
}

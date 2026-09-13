import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ScanResult, ScannerEvent, ScannerGate } from "../../types/scanner";

interface ScanResultCardProps {
  result: ScanResult;
  event: ScannerEvent;
  gate: ScannerGate;
}

const META: Record<
  ScanResult["type"],
  { icon: typeof CheckCircle2; iconColor: string; bg: string; title: string; subtitle: string }
> = {
  valid: { icon: CheckCircle2, iconColor: "text-green-600", bg: "bg-green-50", title: "Ticket valid", subtitle: "Entry approved" },
  duplicate: { icon: XCircle, iconColor: "text-red-600", bg: "bg-red-50", title: "Ticket already used", subtitle: "Entry rejected" },
  invalid: { icon: XCircle, iconColor: "text-red-600", bg: "bg-red-50", title: "Invalid ticket", subtitle: "Entry rejected" },
  wrongEvent: { icon: AlertTriangle, iconColor: "text-amber-600", bg: "bg-amber-50", title: "Wrong event", subtitle: "Entry rejected" },
  expired: { icon: AlertTriangle, iconColor: "text-amber-600", bg: "bg-amber-50", title: "Ticket expired", subtitle: "Entry rejected" },
  transferred: { icon: XCircle, iconColor: "text-red-600", bg: "bg-red-50", title: "Ticket no longer valid", subtitle: "Entry rejected" },
};

function DetailRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-gray-900 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export function ScanResultCard({ result, event, gate }: ScanResultCardProps) {
  const meta = META[result.type];
  const Icon = meta.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className={`flex flex-col items-center gap-2 ${meta.bg} px-6 py-9`}>
        <Icon className={`h-12 w-12 ${meta.iconColor}`} strokeWidth={1.6} />
        <div className="text-xl font-semibold text-gray-900">{meta.title}</div>
        <div className="text-sm text-gray-500">{meta.subtitle}</div>
      </div>

      <div className="px-5 py-2">
        {result.type === "invalid" && (
          <>
            <p className="py-3 text-sm leading-relaxed text-gray-500">
              This ticket could not be verified. Ask the attendee to check their confirmation email.
            </p>
            <DetailRow label="Ticket ID" value={result.code} mono />
          </>
        )}

        {result.type === "wrongEvent" && (
          <>
            <p className="py-3 text-sm leading-relaxed text-gray-500">
              This ticket belongs to a different event and can't be used at this gate.
            </p>
            <DetailRow label="Ticket" value={result.code} mono />
            <DetailRow label="Ticket's event" value={result.ticketEventName} />
            <DetailRow label="Expected event" value={event.name} />
          </>
        )}

        {result.type === "expired" && (
          <>
            <p className="py-3 text-sm leading-relaxed text-gray-500">This ticket is no longer valid for entry.</p>
            <DetailRow label="Attendee" value={result.ticket?.attendee} />
            <DetailRow label="Ticket ID" value={result.code} mono />
            <DetailRow label="Event" value={event.name} />
          </>
        )}

        {result.type === "transferred" && (
          <>
            <p className="py-3 text-sm leading-relaxed text-gray-500">
              This ticket has been transferred to another attendee. The original QR code is no longer valid.
            </p>
            <DetailRow label="Ticket ID" value={result.code} mono />
          </>
        )}

        {(result.type === "valid" || result.type === "duplicate") && (
          <>
            <DetailRow label="Attendee" value={result.ticket?.attendee} />
            <DetailRow label="Ticket type" value={result.ticket?.type} />
            <DetailRow label="Ticket ID" value={result.code} mono />
            <DetailRow label="Gate" value={gate.name} />
            <DetailRow
              label={result.type === "duplicate" ? "Checked in" : "Checked in at"}
              value={result.type === "duplicate" ? result.ticket?.checkedInTime : result.time}
              mono
            />
            {result.type === "duplicate" && <DetailRow label="Previous gate" value={result.ticket?.checkedInGate} />}
          </>
        )}
      </div>
    </div>
  );
}

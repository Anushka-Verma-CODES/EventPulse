import { Link, useParams } from "react-router-dom";
import { Calendar, History } from "lucide-react";
import UserMenu from "../layout/UserMenu";
import { mockScannerUser, gatesByEvent } from "../../lib/scannerMockData";

export default function ScannerHeader() {
  const { eventId, gateId } = useParams();

  const gate = eventId && gateId ? gatesByEvent[eventId]?.find((g) => g.id === gateId) : undefined;

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4">
      <Link to="/scanner" className="flex items-center gap-2 hover:opacity-80">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2563EB] text-white">
          <Calendar className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-semibold text-[#1E293B]">EventPulse Scanner</span>
      </Link>

      <div className="flex items-center gap-3">
        {gate && (
          <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#2563EB]">
            {gate.name}
          </span>
        )}

        <Link
          to="/scanner/history"
          className="relative rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"
          aria-label="Scan history"
        >
          <History className="h-5 w-5" />
        </Link>

        <UserMenu
          name={mockScannerUser.name}
          email="scanner@eventpulse.io"
          initials={mockScannerUser.initials}
          profileRoute="/scanner/profile"
          settingsRoute="/scanner/settings"
          currentRole="scanner"
        />
      </div>
    </header>
  );
}

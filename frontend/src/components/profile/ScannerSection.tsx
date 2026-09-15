import { Link } from "react-router-dom";
import StatGrid from "./StatGrid";
import {
  scannerStaffInfo,
  scannerCurrentAssignment,
  scannerActivityStats,
  scannerTodayStats,
  scannerRecentScans,
  scannerAssignedEvents,
} from "../../lib/profileMockData";

const scanResultColor: Record<string, string> = {
  Valid: "text-[#16A34A]",
  "Already Used": "text-[#DC2626]",
  Invalid: "text-[#DC2626]",
};

export default function ScannerSection() {
  return (
    <>
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1E293B]">Staff Information</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-[#64748B]">Staff ID</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{scannerStaffInfo.staffId}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Organization</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{scannerStaffInfo.organization}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Staff Role</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{scannerStaffInfo.staffRole}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Current Assignment</h2>
        <div className="text-base font-medium text-[#1E293B]">{scannerCurrentAssignment.event}</div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <div className="text-xs text-[#64748B]">Date</div>
            <div className="text-[#1E293B]">{scannerCurrentAssignment.date}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Gate</div>
            <div className="text-[#1E293B]">{scannerCurrentAssignment.gate}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Shift</div>
            <div className="text-[#1E293B]">{scannerCurrentAssignment.shift}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Status</div>
            <div className="flex items-center gap-1.5 font-medium text-[#16A34A]">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {scannerCurrentAssignment.status}
            </div>
          </div>
        </div>
        <Link
          to={`/scanner`}
          className="mt-3 inline-block rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          View Assignment
        </Link>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Scanner Activity</h2>
        <StatGrid stats={scannerActivityStats} />
        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
          Today&apos;s Activity
        </h3>
        <StatGrid stats={scannerTodayStats} />
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Recent Scans</h2>
        <div className="flex flex-col divide-y divide-[#E2E8F0]">
          {scannerRecentScans.map((scan, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-sm">
              <span className="text-[#1E293B]">{scan.ticketId}</span>
              <span className={scanResultColor[scan.result]}>
                {scan.result === "Valid" ? "\u2713" : "\u2715"} {scan.result}
              </span>
              <span className="text-[#64748B]">{scan.time}</span>
            </div>
          ))}
        </div>
        <Link
          to="/scanner/history"
          className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline"
        >
          View Scan History
        </Link>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Assigned Events</h2>
        <div className="flex flex-col divide-y divide-[#E2E8F0]">
          {scannerAssignedEvents.map((event) => (
            <div key={event.event} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <div className="font-medium text-[#1E293B]">{event.event}</div>
                <div className="text-[#64748B]">
                  {event.date} &bull; {event.gate}
                </div>
              </div>
              <span
                className={
                  event.status === "Completed" ? "text-[#16A34A]" : "text-[#2563EB]"
                }
              >
                {event.status === "Completed" ? "\u2713" : "\u25CF"} {event.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

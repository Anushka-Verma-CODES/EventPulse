import { gateStats, recentScans } from "../../lib/organizerMockData";
import StatusBadge from "../../components/organizer/StatusBadge";

export default function LiveMonitoring() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">Live Event Monitoring</h2>
          <p className="mt-1 text-sm text-[#64748B]">Tech Fest 2026</p>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-medium text-[#16A34A]">
          <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> Live
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">1,420</div>
          <div className="mt-1 text-xs text-[#64748B]">Total Attendance</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">1,420</div>
          <div className="mt-1 text-xs text-[#64748B]">Checked In</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">580</div>
          <div className="mt-1 text-xs text-[#64748B]">Remaining</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">28</div>
          <div className="mt-1 text-xs text-[#64748B]">Scans / Minute</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gateStats.map((gate) => (
          <div key={gate.name} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1E293B]">{gate.name}</span>
              <StatusBadge status={gate.status} />
            </div>
            <div className="text-2xl font-semibold text-[#1E293B]">{gate.entries}</div>
            <div className="text-xs text-[#64748B]">Entries</div>
            <div className="mt-2 text-xs text-[#64748B]">{gate.scansPerMin} scans/min</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">Recent Scans</h3>
        <div className="flex flex-col divide-y divide-[#E2E8F0] text-sm">
          {recentScans.map((scan, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <span className="text-[#64748B]">{scan.time}</span>
              <span className="text-[#1E293B]">{scan.gate}</span>
              <StatusBadge status={scan.result} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

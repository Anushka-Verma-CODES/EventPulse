import { reportSummary, reportSections } from "../../lib/organizerMockData";

export default function Reports() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Event Report</h2>
      <p className="mt-1 text-sm text-[#64748B]">Tech Fest 2026 &bull; 18 October 2026</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {reportSummary.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="text-2xl font-semibold text-[#1E293B]">{stat.value}</div>
            <div className="mt-1 text-xs text-[#64748B]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">Report Sections</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {reportSections.map((section) => (
            <div
              key={section}
              className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm"
            >
              <span className="text-[#1E293B]">{section}</span>
              <button className="text-xs font-medium text-[#2563EB] hover:underline">
                View
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#64748B]">
          Charts (registration vs. check-in, attendance by gate, peak arrival time, etc.)
          aren&apos;t wired up yet — this section is ready for Recharts once real report
          data is available.
        </p>
      </div>
    </div>
  );
}

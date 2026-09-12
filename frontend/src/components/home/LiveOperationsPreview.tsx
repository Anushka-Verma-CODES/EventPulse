const recentScans = [
  { time: "10:42:18", gate: "Gate 2", result: "Valid" },
  { time: "10:42:15", gate: "Gate 1", result: "Valid" },
  { time: "10:42:11", gate: "Gate 2", result: "Duplicate" },
  { time: "10:42:07", gate: "Gate 3", result: "Valid" },
];

const resultColor: Record<string, string> = {
  Valid: "text-[#16A34A]",
  Duplicate: "text-[#DC2626]",
};

export default function LiveOperationsPreview() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-[#1E293B]">
          Know what&apos;s happening during your event.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          Monitor attendance, gate activity and operational status from a single dashboard.
        </p>

        <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-[#1E293B]">Live Event Monitoring</div>
              <div className="text-xs text-[#64748B]">Tech Fest 2026</div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> Live
            </span>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3 border-y border-[#E2E8F0] py-4 text-center">
            <div>
              <div className="text-lg font-semibold text-[#1E293B]">1,420</div>
              <div className="text-xs text-[#64748B]">Total Attendance</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[#1E293B]">1,420</div>
              <div className="text-xs text-[#64748B]">Checked In</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[#1E293B]">580</div>
              <div className="text-xs text-[#64748B]">Remaining</div>
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#1E293B]">Gate 1</span>
              <span className="text-[#64748B]">520 entries</span>
              <span className="text-[#16A34A]">Normal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#1E293B]">Gate 2</span>
              <span className="text-[#64748B]">710 entries</span>
              <span className="text-[#D97706]">Busy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#1E293B]">Gate 3</span>
              <span className="text-[#64748B]">190 entries</span>
              <span className="text-[#16A34A]">Normal</span>
            </div>
          </div>

          <div className="mb-2 text-xs font-semibold text-[#1E293B]">Recent Scans</div>
          <div className="flex flex-col gap-1.5 text-xs">
            {recentScans.map((scan, i) => (
              <div key={i} className="flex items-center justify-between text-[#64748B]">
                <span>{scan.time}</span>
                <span>{scan.gate}</span>
                <span className={resultColor[scan.result]}>{scan.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

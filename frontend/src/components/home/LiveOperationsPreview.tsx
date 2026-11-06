
const recentScans = [
  { time: "10:42:18", gate: "Gate 2", ticket: "EP-A81F29D0", result: "Valid" },
  { time: "10:42:11", gate: "Gate 2", ticket: "EP-C63D07A2", result: "Duplicate" },
];

const gates = [
  { name: "Gate 1", entries: 520, percentage: 73, status: "Normal" },
  { name: "Gate 2", entries: 710, percentage: 90, status: "Busy" },
  { name: "Gate 3", entries: 190, percentage: 42, status: "Normal" },
];

export default function LiveOperationsPreview() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="text-xs font-semibold tracking-[0.16em] text-[#2563EB]">
              EVENT OPERATIONS
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#1E293B] sm:text-4xl">
              Stay in control, even when the event gets busy.
            </h2>

            <p className="mt-5 text-base leading-7 text-[#64748B]">
              Keep track of ticket check-ins, monitor entry gates and identify
              scanning issues through a single event operations dashboard.
            </p>

            <div className="mt-7 space-y-4">
              {[
                {
                  number: "01",
                  title: "Track attendance",
                  description: "See ticket check-ins and remaining entries.",
                },
                {
                  number: "02",
                  title: "Monitor every gate",
                  description: "Compare entry activity across event gates.",
                },
                {
                  number: "03",
                  title: "Catch scan issues",
                  description: "Identify valid and duplicate ticket scans.",
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4">
                  <span className="pt-0.5 text-sm font-semibold text-[#2563EB]">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1E293B]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#DBEAFE] bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div>
                <p className="text-xs font-medium text-[#64748B]">
                  DASHBOARD PREVIEW
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#1E293B]">
                  Tech Fest 2026
                </h3>
                <p className="mt-1 text-xs text-[#64748B]">
                  Event operations overview
                </p>
              </div>

              <span className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-[#2563EB]">
                Sample data
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { value: "2,000", label: "Tickets" },
                { value: "1,420", label: "Checked in" },
                { value: "580", label: "Remaining" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-lg font-bold text-[#1E293B] sm:text-xl">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#1E293B]">
                  Attendance progress
                </h4>
                <span className="text-sm font-bold text-[#2563EB]">
                  71%
                </span>
              </div>

              <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full bg-[#2563EB]"
                  style={{ width: "71%" }}
                />
              </div>

              <div className="mt-2 flex justify-between text-xs text-[#64748B]">
                <span>1,420 checked in</span>
                <span>2,000 capacity</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#1E293B]">
                  Gate activity
                </h4>
                <span className="text-xs text-[#64748B]">
                  Entries by gate
                </span>
              </div>

              <div className="space-y-3">
                {gates.map((gate) => (
                  <div key={gate.name}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#334155]">
                        {gate.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#64748B]">
                          {gate.entries} entries
                        </span>
                        <span
                          className={
                            gate.status === "Busy"
                              ? "font-medium text-amber-600"
                              : "font-medium text-emerald-600"
                          }
                        >
                          {gate.status}
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-[#F1F5F9]">
                      <div
                        className="h-full rounded-full bg-[#60A5FA]"
                        style={{ width: `${gate.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-[#E2E8F0] pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#1E293B]">
                  Recent ticket scans
                </h4>
                <span className="text-xs text-[#64748B]">
                  Activity preview
                </span>
              </div>

              <div className="space-y-2">
                {recentScans.map((scan) => (
                  <div
                    key={scan.ticket}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#334155]">
                        {scan.ticket}
                      </p>
                      <p className="mt-0.5 text-[#94A3B8]">
                        {scan.time} · {scan.gate}
                      </p>
                    </div>

                    <span
                      className={
                        scan.result === "Valid"
                          ? "shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700"
                          : "shrink-0 rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-700"
                      }
                    >
                      {scan.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

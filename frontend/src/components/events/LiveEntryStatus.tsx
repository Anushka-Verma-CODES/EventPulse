import { mockEventDetail } from "../../lib/registrationMockData";

export default function LiveEntryStatus() {
  const { gates } = mockEventDetail;
  const recommended = gates.reduce((best, gate) => (gate.scansPerMin < best.scansPerMin ? gate : best));

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A]" />
        <h2 className="text-lg font-semibold text-[#1E293B]">Live Entry Status</h2>
      </div>

      <div className="flex flex-col divide-y divide-[#E2E8F0]">
        {gates.map((gate) => (
          <div key={gate.name} className="flex items-center justify-between py-2.5 text-sm">
            <span className="font-medium text-[#1E293B]">{gate.name}</span>
            <span className={gate.status === "Normal" ? "text-[#16A34A]" : "text-[#DC2626]"}>
              &#9679; {gate.status}
            </span>
            <span className="text-[#64748B]">{gate.scansPerMin} scans/min</span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-sm font-medium text-[#16A34A]">
        &#10003; Recommended: {recommended.name}
      </div>
    </div>
  );
}

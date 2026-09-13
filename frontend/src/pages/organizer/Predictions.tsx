import { predictionCards, predictedResources } from "../../lib/organizerMockData";

export default function Predictions() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Event Planning Insights</h2>
      <p className="mt-1 text-sm text-[#64748B]">Tech Fest 2026</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {predictionCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            <div className="text-xs text-[#64748B]">{card.label}</div>
            <div className="mt-1 text-xl font-semibold text-[#1E293B]">{card.value}</div>
            {card.unit && <div className="text-xs text-[#64748B]">{card.unit}</div>}
          </div>
        ))}
      </div>

      <div className="mt-6 max-w-md rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[#1E293B]">Estimated Resources</h3>
        <div className="flex flex-col gap-2.5 text-sm">
          {predictedResources.map((r) => (
            <div key={r.name} className="flex items-center justify-between">
              <span className="text-[#64748B]">{r.name}</span>
              <span className="font-medium text-[#1E293B]">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

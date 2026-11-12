
type GateHistory = {
  gateId: string;
  gateName: string;
  thirdWindowEntries: number;
  previousWindowEntries: number;
  latestWindowEntries: number;
  predictedEntries: number;
};

type HistoricalTrafficChartProps = {
  gates: GateHistory[];
};

const windowLabels = [
  "10–15 min ago",
  "5–10 min ago",
  "Last 5 min",
  "Next 5 min (predicted)",
];

const barColors = [
  "bg-slate-300",
  "bg-slate-400",
  "bg-blue-500",
  "bg-indigo-500",
];

export default function HistoricalTrafficChart({
  gates,
}: HistoricalTrafficChartProps) {
  if (gates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-6 text-center">
        <p className="text-sm font-medium text-[#475569]">
          No historical traffic data available
        </p>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Traffic history will appear after successful gate check-ins.
        </p>
      </div>
    );
  }

  const maxValue = Math.max(
    1,
    ...gates.flatMap((gate) => [
      gate.thirdWindowEntries,
      gate.previousWindowEntries,
      gate.latestWindowEntries,
      gate.predictedEntries,
    ]),
  );

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-[#1E293B]">
          Historical Gate Traffic
        </h3>
        <p className="mt-1 text-sm text-[#64748B]">
          Successful entries across consecutive 5-minute windows
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {windowLabels.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-sm ${barColors[index]}`}
            />
            <span className="text-xs text-[#64748B]">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-7">
        {gates.map((gate) => {
          const values = [
            gate.thirdWindowEntries,
            gate.previousWindowEntries,
            gate.latestWindowEntries,
            gate.predictedEntries,
          ];

          return (
            <div key={gate.gateId}>
              <h4 className="mb-3 text-sm font-semibold text-[#334155]">
                {gate.gateName}
              </h4>

              <div className="space-y-3">
                {values.map((value, index) => (
                  <div
                    key={windowLabels[index]}
                    className="grid grid-cols-[110px_minmax(0,1fr)_35px] items-center gap-3"
                  >
                    <span className="text-xs text-[#64748B]">
                      {windowLabels[index]}
                    </span>

                    <div className="h-3 overflow-hidden rounded-full bg-[#F1F5F9]">
                      <div
                        className={`h-full rounded-full transition-all ${barColors[index]}`}
                        style={{
                          width: `${(value / maxValue) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="text-right text-xs font-semibold tabular-nums text-[#334155]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t border-[#E2E8F0] pt-3 text-xs text-[#94A3B8]">
        Historical values represent recorded entries. Predicted values are
        estimates, not confirmed check-ins.
      </p>
    </section>
  );
}

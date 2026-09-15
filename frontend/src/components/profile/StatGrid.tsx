interface StatGridProps {
  stats: { label: string; value: string }[];
}

const colsClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export default function StatGrid({ stats }: StatGridProps) {
  const cols = colsClass[Math.min(stats.length, 4)] ?? "sm:grid-cols-4";

  return (
    <div className={`grid grid-cols-2 gap-3 ${cols}`}>
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="text-xl font-semibold text-[#1E293B]">{stat.value}</div>
          <div className="mt-1 text-xs text-[#64748B]">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="text-2xl font-semibold text-[#1E293B]">{value}</div>
      <div className="mt-1 text-xs text-[#64748B]">{label}</div>
    </div>
  );
}

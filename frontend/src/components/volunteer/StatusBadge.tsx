const toneMap: Record<string, string> = {
  Normal: "bg-[#F0FDF4] text-[#16A34A]",
  Busy: "bg-[#FFFBEB] text-[#D97706]",
  Valid: "bg-[#F0FDF4] text-[#16A34A]",
  Duplicate: "bg-[#FEF2F2] text-[#DC2626]",
  "Checked In": "bg-[#F0FDF4] text-[#16A34A]",
  "Not Checked In": "bg-[#F8FAFC] text-[#64748B]",
  Upcoming: "bg-[#EFF6FF] text-[#2563EB]",
  Draft: "bg-[#F8FAFC] text-[#64748B]",
  Ongoing: "bg-[#FFFBEB] text-[#D97706]",
  Completed: "bg-[#F0FDF4] text-[#16A34A]",
  Assigned: "bg-[#F0FDF4] text-[#16A34A]",
  Pending: "bg-[#FFFBEB] text-[#D97706]",
  Accepted: "bg-[#F0FDF4] text-[#16A34A]",
  Rejected: "bg-[#FEF2F2] text-[#DC2626]",
  Available: "bg-[#F0FDF4] text-[#16A34A]",
  Low: "bg-[#FFFBEB] text-[#D97706]",
  Critical: "bg-[#FEF2F2] text-[#DC2626]",
  Open: "bg-[#FEF2F2] text-[#DC2626]",
  "In Progress": "bg-[#FFFBEB] text-[#D97706]",
  Resolved: "bg-[#F0FDF4] text-[#16A34A]",
  High: "bg-[#FEF2F2] text-[#DC2626]",
  Medium: "bg-[#FFFBEB] text-[#D97706]",
};

export default function StatusBadge({ status }: { status: string }) {
  const classes = toneMap[status] ?? "bg-[#F8FAFC] text-[#64748B]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

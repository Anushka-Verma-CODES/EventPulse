import { resources } from "../../lib/organizerMockData";
import StatusBadge from "../../components/organizer/StatusBadge";

const barColor: Record<string, string> = {
  Available: "bg-[#16A34A]",
  Low: "bg-[#D97706]",
  Critical: "bg-[#DC2626]",
};

export default function Resources() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Resources</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <div
            key={resource.name}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1E293B]">{resource.name}</span>
              <StatusBadge status={resource.status} />
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className={`h-full rounded-full ${barColor[resource.status]}`}
                style={{ width: `${resource.percentage}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-[#64748B]">
              {resource.used.toLocaleString()} / {resource.total.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

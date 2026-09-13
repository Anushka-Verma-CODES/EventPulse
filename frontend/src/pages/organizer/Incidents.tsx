import { useState } from "react";
import { incidents } from "../../lib/organizerMockData";
import StatusBadge from "../../components/organizer/StatusBadge";

const filters = ["All", "Open", "In Progress", "Resolved"];

export default function Incidents() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All" ? incidents : incidents.filter((i) => i.status === activeFilter);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Incidents</h2>

      <div className="mt-5 flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((incident) => (
          <div
            key={incident.title}
            className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#1E293B]">{incident.title}</h3>
              <StatusBadge status={incident.priority} />
            </div>
            <div className="text-xs text-[#64748B]">Reported: {incident.reportedAt}</div>
            <div className="text-xs text-[#64748B]">Location: {incident.location}</div>
            <div className="mt-3 flex items-center justify-between">
              <StatusBadge status={incident.status} />
              <button className="text-xs font-medium text-[#2563EB] hover:underline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

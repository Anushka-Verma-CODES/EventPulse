import { useState } from "react";
import { applications } from "../../lib/volunteerMockData";
import StatusBadge from "../../components/volunteer/StatusBadge";

const filters = ["All", "Pending", "Approved", "Rejected"];

export default function MyApplications() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All" ? applications : applications.filter((a) => a.status === activeFilter);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">My Applications</h2>

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

      <div className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Applied On</th>
              <th className="px-4 py-3 font-medium">Shift</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filtered.map((app) => (
              <tr key={`${app.event}-${app.role}`}>
                <td className="px-4 py-3 font-medium text-[#1E293B]">{app.event}</td>
                <td className="px-4 py-3 text-[#64748B]">{app.role}</td>
                <td className="px-4 py-3 text-[#64748B]">{app.appliedOn}</td>
                <td className="px-4 py-3 text-[#64748B]">{app.shift}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

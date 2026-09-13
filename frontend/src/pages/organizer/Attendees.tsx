import { useState } from "react";
import { attendees } from "../../lib/organizerMockData";
import StatusBadge from "../../components/organizer/StatusBadge";

const filters = ["All", "Checked In", "Not Checked In"];

export default function Attendees() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const checkedInCount = attendees.filter((a) => a.status === "Checked In").length;
  const notCheckedInCount = attendees.length - checkedInCount;

  const filtered = attendees
    .filter((a) => activeFilter === "All" || a.status === activeFilter)
    .filter((a) => {
      const query = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(query) ||
        a.email.toLowerCase().includes(query) ||
        a.ticket.toLowerCase().includes(query)
      );
    });

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Attendees</h2>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">{attendees.length}</div>
          <div className="mt-1 text-xs text-[#64748B]">Registered</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">{checkedInCount}</div>
          <div className="mt-1 text-xs text-[#64748B]">Checked In</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">{notCheckedInCount}</div>
          <div className="mt-1 text-xs text-[#64748B]">Not Checked In</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
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
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or ticket ID"
          className="w-full max-w-xs rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Registered</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Gate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filtered.map((a) => (
              <tr key={a.email}>
                <td className="px-4 py-3 font-medium text-[#1E293B]">{a.name}</td>
                <td className="px-4 py-3 text-[#64748B]">{a.email}</td>
                <td className="px-4 py-3 text-[#64748B]">{a.ticket}</td>
                <td className="px-4 py-3 text-[#64748B]">{a.registeredOn}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3 text-[#64748B]">{a.gate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

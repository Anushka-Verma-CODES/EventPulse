import { useState } from "react";
import { Link } from "react-router-dom";
import { opportunities } from "../../lib/volunteerMockData";

const filters = ["All", "Upcoming", "Near Me", "My Interests"];

export default function Opportunities() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = opportunities.filter((opp) => {
    const query = search.toLowerCase();
    return opp.event.toLowerCase().includes(query) || opp.role.toLowerCase().includes(query);
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">Volunteer Opportunities</h2>
      <p className="mt-1 text-sm text-[#64748B]">Find events where you can contribute.</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search opportunities..."
        className="mt-4 w-full max-w-md rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
      />

      <div className="mt-3 flex gap-2">
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

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {filtered.map((opp) => (
          <div key={opp.id} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#1E293B]">{opp.event}</h3>
            <div className="mt-2 text-xs text-[#64748B]">
              &#128197; {opp.date} &nbsp; &#128205; {opp.location}
            </div>
            <div className="mt-3 text-sm font-medium text-[#1E293B]">{opp.role}</div>
            <p className="mt-1 text-sm text-[#64748B]">{opp.description}</p>
            <div className="mt-3 text-xs text-[#64748B]">
              Volunteers needed: {opp.positionsAvailable}
            </div>
            <div className="text-xs text-[#64748B]">Shift: {opp.time}</div>
            <Link
              to={`/volunteer/opportunities/${opp.id}`}
              className="mt-4 inline-block rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              View Opportunity
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

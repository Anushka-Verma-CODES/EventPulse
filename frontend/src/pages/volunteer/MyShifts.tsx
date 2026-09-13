import { useState } from "react";
import { Link } from "react-router-dom";
import { shifts } from "../../lib/volunteerMockData";
import StatusBadge from "../../components/volunteer/StatusBadge";

const filters = ["Upcoming", "Today", "Completed"];

export default function MyShifts() {
  const [activeFilter, setActiveFilter] = useState("Upcoming");

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">My Shifts</h2>
      <p className="mt-1 text-sm text-[#64748B]">Manage your upcoming and completed shifts.</p>

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

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {shifts.map((shift) => (
          <div key={shift.id} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-[#1E293B]">{shift.event}</h3>
                <div className="text-sm text-[#64748B]">{shift.role}</div>
              </div>
              <StatusBadge status={shift.status} />
            </div>
            <div className="mt-3 flex flex-col gap-1 text-xs text-[#64748B]">
              <span>&#128197; {shift.date}</span>
              <span>&#9200; {shift.time}</span>
              <span>&#128205; {shift.location}</span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-medium text-[#1E293B]">Responsibilities</div>
              <ul className="mt-1 flex flex-col gap-1 text-xs text-[#64748B]">
                {shift.responsibilities.slice(0, 3).map((item) => (
                  <li key={item}>&bull; {item}</li>
                ))}
              </ul>
            </div>
            <Link
              to={`/volunteer/shifts/${shift.id}`}
              className="mt-4 inline-block rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              View Shift
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

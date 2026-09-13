import { useState } from "react";
import { useParams } from "react-router-dom";
import { opportunities } from "../../lib/volunteerMockData";
import ApplyModal from "../../components/volunteer/ApplyModal";

export default function OpportunityDetail() {
  const { opportunityId } = useParams();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const opportunity = opportunities.find((o) => o.id === opportunityId) ?? opportunities[0];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1E293B]">{opportunity.event}</h2>
      <p className="mt-1 text-base font-medium text-[#1E293B]">{opportunity.role} Volunteer</p>

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#64748B]">
        <span>&#128197; {opportunity.date}</span>
        <span>&#9200; {opportunity.time}</span>
        <span>&#128205; {opportunity.location}</span>
      </div>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1E293B]">About the Role</h3>
        <p className="mt-2 text-sm text-[#64748B]">{opportunity.description}</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-[#1E293B]">Responsibilities</h3>
          <ul className="flex flex-col gap-1.5 text-sm text-[#64748B]">
            {opportunity.responsibilities.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-[#16A34A]">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-[#1E293B]">Requirements</h3>
          <ul className="flex flex-col gap-1.5 text-sm text-[#64748B]">
            {opportunity.requirements.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-[#16A34A]">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div>
          <div className="text-xs text-[#64748B]">Positions Available</div>
          <div className="text-2xl font-semibold text-[#1E293B]">
            {opportunity.positionsAvailable}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsApplyOpen(true)}
          className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          Apply as Volunteer
        </button>
      </div>

      {isApplyOpen && (
        <ApplyModal
          eventName={opportunity.event}
          role={opportunity.role}
          onClose={() => setIsApplyOpen(false)}
        />
      )}
    </div>
  );
}

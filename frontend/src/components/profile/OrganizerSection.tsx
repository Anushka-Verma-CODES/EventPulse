import StatGrid from "./StatGrid";
import { organizerOrgDetails, organizerActivityStats } from "../../lib/profileMockData";

export default function OrganizerSection() {
  return (
    <>
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1E293B]">Organization Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs text-[#64748B]">Organization</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{organizerOrgDetails.organization}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Department / Society</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{organizerOrgDetails.department}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Organizer ID</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{organizerOrgDetails.organizerId}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Contact Email</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{organizerOrgDetails.contactEmail}</div>
          </div>
        </div>
        <button className="mt-4 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]">
          Edit Organization
        </button>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Organizer Activity</h2>
        <StatGrid stats={organizerActivityStats} />
      </div>
    </>
  );
}

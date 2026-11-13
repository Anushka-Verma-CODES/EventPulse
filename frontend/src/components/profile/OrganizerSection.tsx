
import StatGrid from "./StatGrid";
import { organizerActivityStats } from "../../lib/profileMockData";

export default function OrganizerSection() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">
        Organizer Activity
      </h2>

      <StatGrid stats={organizerActivityStats} />
    </div>
  );
}

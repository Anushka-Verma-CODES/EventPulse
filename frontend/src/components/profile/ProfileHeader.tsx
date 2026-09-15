import type { PersonalInfo, ProfileRole } from "../../lib/profileMockData";
import { roleBadgeLabel } from "../../lib/profileMockData";

interface ProfileHeaderProps {
  role: ProfileRole;
  info: PersonalInfo;
  initials: string;
  onEditClick: () => void;
}

export default function ProfileHeader({ role, info, initials, onEditClick }: ProfileHeaderProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-lg font-semibold text-white">
            {initials}
          </span>
          <div>
            <div className="text-lg font-semibold text-[#1E293B]">{info.fullName}</div>
            <div className="text-sm text-[#64748B]">{info.email}</div>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#2563EB]">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {roleBadgeLabel[role]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditClick}
          className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import type { ProfileRole } from "../../lib/profileMockData";

interface AccountSectionProps {
  role: ProfileRole;
}

export default function AccountSection({ role }: AccountSectionProps) {
  const navigate = useNavigate();

  // Scanner accounts are organization-managed, so no self-service
  // account deletion for that role — matches the spec's explicit note.
  const canDeleteAccount = role !== "scanner";

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1E293B]">Account</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          Log Out
        </button>
        {canDeleteAccount && (
          <button
            type="button"
            className="rounded-lg border border-[#FECACA] px-4 py-2 text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2]"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
}

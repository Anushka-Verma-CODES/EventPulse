import { useState } from "react";
import Toggle from "./Toggle";

export default function SecuritySection() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleUpdatePassword() {
    if (!currentPassword || !newPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setSuccess(true);
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1E293B]">Security</h2>

      {success && (
        <p className="mt-2 text-sm text-[#16A34A]">&#10003; Password updated successfully.</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-[#1E293B]">Password</div>
          <div className="text-sm text-[#64748B]">&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</div>
        </div>
        {!isChangingPassword && (
          <button
            type="button"
            onClick={() => {
              setIsChangingPassword(true);
              setSuccess(false);
            }}
            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            Change Password
          </button>
        )}
      </div>

      {isChangingPassword && (
        <div className="mt-4 flex flex-col gap-3 border-t border-[#E2E8F0] pt-4">
          <div>
            <label className="text-xs text-[#64748B]">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          <div>
            <label className="text-xs text-[#64748B]">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          <div>
            <label className="text-xs text-[#64748B]">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          {error && <p className="text-xs text-[#DC2626]">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsChangingPassword(false)}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdatePassword}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
        <div>
          <div className="text-sm font-medium text-[#1E293B]">Two-Factor Authentication</div>
          <div className="text-sm text-[#64748B]">{twoFactorEnabled ? "Enabled" : "Disabled"}</div>
        </div>
        <Toggle checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
      </div>
    </div>
  );
}

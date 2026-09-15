import { useState } from "react";
import { Bell, Check, LockKeyhole, Palette, UserRound } from "lucide-react";

type SettingsRole = "attendee" | "organizer" | "volunteer" | "scanner";

interface SettingsPageProps {
  role: SettingsRole;
}

const roleLabels: Record<SettingsRole, string> = {
  attendee: "Attendee",
  organizer: "Organizer",
  volunteer: "Volunteer",
  scanner: "Scanner",
};

export default function SettingsPage({ role }: SettingsPageProps) {
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="border-b border-[#E2E8F0] pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">{roleLabels[role]} account</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1E293B] sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-[#64748B]">Manage your preferences and account experience.</p>
      </div>

      <div className="mt-6 grid gap-5">
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-bold text-[#1E293B]">Account</h2>
              <p className="mt-1 text-sm text-[#64748B]">Your account identity and role.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Role</p>
              <p className="mt-1 text-sm font-semibold text-[#1E293B]">{roleLabels[role]}</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Email</p>
              <p className="mt-1 truncate text-sm font-semibold text-[#1E293B]">you@example.com</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-bold text-[#1E293B]">Notifications</h2>
              <p className="mt-1 text-sm text-[#64748B]">Choose which updates reach your inbox.</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-[#E2E8F0]">
            <SettingToggle label="Email updates" description="Product updates and important account messages." checked={emailUpdates} onChange={setEmailUpdates} />
            <SettingToggle label="Event reminders" description="Reminders before events, shifts, and ticket deadlines." checked={eventReminders} onChange={setEventReminders} />
          </div>
        </section>

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <Palette className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-bold text-[#1E293B]">Appearance</h2>
              <p className="mt-1 text-sm text-[#64748B]">Adjust how EventPulse feels while you work.</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-[#E2E8F0]">
            <SettingToggle label="Compact mode" description="Use tighter spacing in lists and dashboards." checked={compactMode} onChange={setCompactMode} />
          </div>
        </section>

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-bold text-[#1E293B]">Privacy and security</h2>
              <p className="mt-1 text-sm text-[#64748B]">Keep your account protected.</p>
            </div>
          </div>
          <button type="button" className="mt-5 rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#334155] transition hover:border-[#93C5FD] hover:bg-[#EFF6FF]">
            Change password
          </button>
        </section>
      </div>

      <div className="sticky bottom-0 mt-6 flex flex-col gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC]/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-[#15803D]"><Check className="h-4 w-4" /> Preferences saved</span>}
        <button type="button" onClick={handleSave} className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]">
          Save preferences
        </button>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({ label, description, checked, onChange }: SettingToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <span>
        <span className="block text-sm font-semibold text-[#1E293B]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[#64748B]">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-[#2563EB]" />
    </label>
  );
}

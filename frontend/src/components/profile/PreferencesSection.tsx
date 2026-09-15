import { useState } from "react";
import Toggle from "./Toggle";

interface PreferencesSectionProps {
  showScannerPreferences?: boolean;
}

export default function PreferencesSection({ showScannerPreferences }: PreferencesSectionProps) {
  const [language, setLanguage] = useState("English");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundOnScan, setSoundOnScan] = useState(true);
  const [vibrationOnScan, setVibrationOnScan] = useState(true);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1E293B]">Preferences</h2>

      <div className="mt-4">
        <label className="text-xs text-[#64748B]">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-1 w-full max-w-xs rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        >
          <option>English</option>
          <option>Hindi</option>
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[#E2E8F0] pt-4">
        <Toggle label="Email Notifications" checked={emailNotifications} onChange={setEmailNotifications} />
        <Toggle label="Push Notifications" checked={pushNotifications} onChange={setPushNotifications} />
      </div>

      {showScannerPreferences && (
        <div className="mt-4 border-t border-[#E2E8F0] pt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            Scanner Preferences
          </h3>
          <div className="flex flex-col gap-2">
            <Toggle label="Sound on Scan" checked={soundOnScan} onChange={setSoundOnScan} />
            <Toggle label="Vibration on Scan" checked={vibrationOnScan} onChange={setVibrationOnScan} />
          </div>
        </div>
      )}
    </div>
  );
}

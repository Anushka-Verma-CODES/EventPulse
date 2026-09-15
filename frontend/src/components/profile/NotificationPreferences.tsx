import { useState } from "react";
import Toggle from "./Toggle";

interface NotificationPreferencesProps {
  items: string[];
}

export default function NotificationPreferences({ items }: NotificationPreferencesProps) {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((item) => [item, true]))
  );

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1E293B]">Notification Preferences</h2>
      <div className="mt-3 flex flex-col divide-y divide-[#E2E8F0]">
        {items.map((item) => (
          <div key={item} className="py-2">
            <Toggle
              label={item}
              checked={state[item]}
              onChange={(checked) => setState((prev) => ({ ...prev, [item]: checked }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

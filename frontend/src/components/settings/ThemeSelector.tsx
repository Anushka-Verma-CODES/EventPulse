
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import type { Theme } from "../../context/ThemeContext";

const themeOptions: {
  value: Theme;
  label: string;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Use the light appearance",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use the dark appearance",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device settings",
    icon: Monitor,
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mt-5">
      <p className="text-sm font-semibold text-[#1E293B]">
        Theme
      </p>
      <p className="mt-1 text-xs text-[#64748B]">
        Choose how EventPulse looks on your device.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const selected = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={selected}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]"
                  : "border-[#E2E8F0] bg-white hover:border-[#93C5FD]"
              }`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  selected ? "text-[#2563EB]" : "text-[#64748B]"
                }`}
              />

              <span>
                <span className="block text-sm font-semibold text-[#1E293B]">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#64748B]">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

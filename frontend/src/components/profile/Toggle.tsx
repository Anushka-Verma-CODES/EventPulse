interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      {label && <span className="text-sm text-[#1E293B]">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`flex h-6 w-11 flex-shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? "justify-end bg-[#2563EB]" : "justify-start bg-[#E2E8F0]"
        }`}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow" />
      </button>
    </label>
  );
}

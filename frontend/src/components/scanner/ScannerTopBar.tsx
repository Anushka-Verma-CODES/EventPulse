import { ArrowLeft, ScanLine } from "lucide-react";
import { useScanner } from "../../context/ScannerContext";

interface ScannerTopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function ScannerTopBar({ title, subtitle, onBack, right }: ScannerTopBarProps) {
  const { staff } = useScanner();
  const initials = staff.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <ScanLine className="h-5 w-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold text-gray-900">{title}</div>
        {subtitle && <div className="truncate text-xs text-gray-500">{subtitle}</div>}
      </div>

      {right}

      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
        {initials}
      </div>
    </div>
  );
}

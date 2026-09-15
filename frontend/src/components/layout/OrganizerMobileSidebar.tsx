import { X } from "lucide-react";
import OrganizerSidebar from "./OrganizerSidebar";

interface OrganizerMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrganizerMobileSidebar({ isOpen, onClose }: OrganizerMobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 lg:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 h-full w-[248px] shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-[-40px] top-4 rounded-lg bg-white/90 p-1.5 text-[#1E293B] shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>
        <OrganizerSidebar onNavigate={onClose} initiallyCollapsed={false} />
      </div>
    </div>
  );
}

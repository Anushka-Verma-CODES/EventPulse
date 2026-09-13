import { Menu, Search, Bell } from "lucide-react";
import UserMenu from "./UserMenu";
import { mockOrganizer } from "../../lib/organizerMockData";

interface OrganizerNavbarProps {
  pageTitle: string;
  onOpenMobileSidebar: () => void;
}

export default function OrganizerNavbar({ pageTitle, onOpenMobileSidebar }: OrganizerNavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#1E293B]">{pageTitle}</h1>
      </div>

      <div className="hidden flex-1 justify-center px-6 md:flex">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search events, attendees, etc."
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="relative rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <UserMenu
          name={mockOrganizer.name}
          email={mockOrganizer.email}
          initials={mockOrganizer.initials}
          profileRoute="/organizer/profile"
        />
      </div>
    </header>
  );
}

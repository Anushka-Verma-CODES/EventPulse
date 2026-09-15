import { Link } from "react-router-dom";
import { Menu, Search, Bell } from "lucide-react";
import UserMenu from "./UserMenu";
import { mockVolunteer, notifications } from "../../lib/volunteerMockData";

interface VolunteerNavbarProps {
  pageTitle: string;
  onOpenMobileSidebar: () => void;
}

export default function VolunteerNavbar({ onOpenMobileSidebar }: VolunteerNavbarProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[#E2E8F0]/80 bg-white/75 px-3 backdrop-blur-md sm:px-5">
      <div className="flex items-center gap-3">
        <span
          title="Volunteer"
          aria-label="Volunteer role"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED] text-xs font-bold text-white"
        >
          V
        </span>
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="hidden flex-1 justify-center px-4 md:flex">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search opportunities, shifts, etc."
            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-9 pr-3 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          to="/events"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#2563EB]"
          aria-label="Events"
        >
          {/* <CalendarDays className="h-4 w-4" /> */}
          <span className="hidden sm:inline">Events</span>
        </Link>
        <Link
          to="/volunteer/notifications"
          className="relative rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Link>
        <UserMenu
          name={mockVolunteer.name}
          email={mockVolunteer.email}
          initials={mockVolunteer.initials}
          profileRoute="/volunteer/profile"
          settingsRoute="/volunteer/settings"
          currentRole="volunteer"
        />
      </div>
    </header>
  );
}

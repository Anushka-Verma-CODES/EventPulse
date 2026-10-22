import { Link } from "react-router-dom";
import { Menu, Bell, CalendarDays } from "lucide-react";
import UserMenu from "./UserMenu";

interface VolunteerNavbarProps {
  pageTitle: string;
  onOpenMobileSidebar: () => void;
}

export default function VolunteerNavbar({
  onOpenMobileSidebar,
}: VolunteerNavbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[#E2E8F0]/80 bg-white/75 px-3 backdrop-blur-md sm:px-5">
      <div className="flex items-center gap-3">
        <span
          title="Volunteer"
          aria-label="Volunteer role"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F766E] text-xs font-bold text-white"
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

      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          to="/events"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#2563EB]"
          aria-label="Events"
        >
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Events</span>
        </Link>

        <Link
          to="/volunteer/notifications"
          className="relative rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <UserMenu
          profileRoute="/volunteer/profile"
          settingsRoute="/volunteer/settings"
          currentRole="volunteer"
        />
      </div>
    </header>
  );
}

import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Radio,
  HeartHandshake,
  Package,
  AlertTriangle,
  TrendingUp,
  FileText,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/organizer/dashboard", icon: LayoutDashboard },
  { label: "Events", to: "/organizer/events", icon: Calendar },
  { label: "Attendees", to: "/organizer/attendees", icon: Users },
  { label: "Live Monitoring", to: "/organizer/monitoring", icon: Radio },
  { label: "Volunteers", to: "/organizer/volunteers", icon: HeartHandshake },
  { label: "Resources", to: "/organizer/resources", icon: Package },
  { label: "Incidents", to: "/organizer/incidents", icon: AlertTriangle },
  { label: "Predictions", to: "/organizer/predictions", icon: TrendingUp },
  { label: "Reports", to: "/organizer/reports", icon: FileText },
];

interface OrganizerSidebarProps {
  onNavigate?: () => void;
}

export default function OrganizerSidebar({ onNavigate }: OrganizerSidebarProps) {
  const navigate = useNavigate();

  function handleLogout() {
    navigate("/login");
  }

  return (
    <aside className="flex h-full w-[248px] flex-col border-r border-[#E2E8F0] bg-white">
      <Link to="/" className="flex items-center gap-2 px-5 py-5 hover:opacity-80">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white">
          <Calendar className="h-4 w-4" />
        </span>
        <span className="text-lg font-semibold text-[#1E293B]">EventPulse</span>
      </Link>

      <div className="px-5 pb-2 pt-2 text-[11px] font-semibold tracking-wide text-[#94A3B8]">
        ORGANIZER
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-[#EFF6FF] font-medium text-[#2563EB]"
                    : "text-[#1E293B] hover:bg-[#F8FAFC] hover:text-[#2563EB]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#2563EB]" : "text-[#64748B]"}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#E2E8F0] p-3">
        <NavLink
          to="/organizer/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive ? "bg-[#EFF6FF] font-medium text-[#2563EB]" : "text-[#1E293B] hover:bg-[#F8FAFC]"
            }`
          }
        >
          <User className="h-4.5 w-4.5 text-[#64748B]" />
          Profile
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#DC2626]"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

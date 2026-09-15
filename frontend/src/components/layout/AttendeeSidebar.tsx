import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/attendee/dashboard", icon: LayoutDashboard },
  { label: "Events", to: "/events", icon: Calendar },
  { label: "My Tickets", to: "/attendee/tickets", icon: Ticket },
  { label: "Profile", to: "/attendee/profile", icon: User },
];

interface AttendeeSidebarProps {
  onNavigate?: () => void;
}

export default function AttendeeSidebar({ onNavigate }: AttendeeSidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  function handleLogout() {
    // Later: clear the auth session/token here before redirecting.
    navigate("/login");
  }
  return (
    <aside
      className={`flex h-full flex-col border-r border-[#E2E8F0] bg-white transition-[width] duration-300 ${
        isCollapsed ? "w-[76px]" : "w-[248px]"
      }`}
    >
      <Link
        to="/"
        title="EventPulse home"
        className={`flex items-center gap-2 py-5 hover:opacity-80 ${isCollapsed ? "justify-center px-3" : "px-5"}`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white">
          <Calendar className="h-4 w-4" />
        </span>
        {!isCollapsed && <span className="text-lg font-semibold text-[#1E293B]">EventPulse</span>}
      </Link>

      <button
        type="button"
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`mx-3 mb-4 flex items-center rounded-lg py-2 text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#2563EB] ${
          isCollapsed ? "justify-center" : "gap-2 px-3"
        }`}
      >
        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        {!isCollapsed && <span className="text-xs font-semibold">Collapse menu</span>}
      </button>

      {!isCollapsed && (
        <div className="px-5 pb-2 text-[11px] font-semibold tracking-wide text-[#94A3B8]">
          NAVIGATION
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center rounded-lg py-2.5 text-sm transition-colors ${
                  isCollapsed ? "justify-center px-2" : "justify-between px-3" 
                } ${
                  isActive
                    ? "bg-[#EFF6FF] font-medium text-[#2563EB]"
                    : "text-[#1E293B] hover:bg-[#F8FAFC] hover:text-[#2563EB]"
                }`
              }
            >
              {({ isActive }) => (
                <span className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"}`}>
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#2563EB]" : "text-[#64748B]"}`} />
                  {!isCollapsed && item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#E2E8F0] p-3">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className={`flex w-full items-center rounded-lg py-2.5 text-sm text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#DC2626] ${
            isCollapsed ? "justify-center px-2" : "gap-2.5 px-3"
          }`}
        >
          <LogOut className="h-4.5 w-4.5" />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown, Check, Repeat2 } from "lucide-react";

type UserRole = "attendee" | "organizer" | "volunteer";

const roleOptions: Array<{ id: UserRole; label: string; route: string }> = [
  { id: "attendee", label: "Attendee", route: "/attendee/dashboard" },
  { id: "organizer", label: "Organizer", route: "/organizer/dashboard" },
  { id: "volunteer", label: "Volunteer", route: "/volunteer/dashboard" },
];

const roleLabels: Record<UserRole, string> = {
  attendee: "Attendee",
  organizer: "Organizer",
  volunteer: "Volunteer",
};

interface UserMenuProps {
  name: string;
  email: string;
  initials: string;
  profileRoute: string;
  settingsRoute: string;
  currentRole: UserRole;
}

export default function UserMenu({ name, email, initials, profileRoute, settingsRoute, currentRole }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    navigate("/login");
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[#F8FAFC]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden font-medium text-[#1E293B] sm:inline">
          {name.split(" ")[0]}
        </span>
        <span className="hidden rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2563EB] md:inline">
          {roleLabels[currentRole]}
        </span>
        <ChevronDown className="h-4 w-4 text-[#64748B]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-[#E2E8F0] bg-white py-1.5 shadow-lg">
          <div className="border-b border-[#E2E8F0] px-4 py-2.5">
            <div className="text-sm font-semibold text-[#1E293B]">{name}</div>
            <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-[#64748B]">
              <span>{email}</span>
              <span className="font-semibold text-[#2563EB]">{roleLabels[currentRole]}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate(profileRoute);
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            <User className="h-4 w-4 text-[#64748B]" />
            View Profile
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate(settingsRoute);
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <button
            type="button"
            onClick={() => setIsRoleMenuOpen((open) => !open)}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            <Repeat2 className="h-4 w-4 text-[#64748B]" />
            <span>Switch role</span>
            <ChevronDown className={`ml-auto h-4 w-4 text-[#64748B] transition-transform ${isRoleMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isRoleMenuOpen && (
            <div className="mx-2 mb-1 rounded-lg bg-[#F8FAFC] p-1">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsRoleMenuOpen(false);
                    navigate(role.route);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs transition-colors ${
                    currentRole === role.id
                      ? "bg-white font-semibold text-[#2563EB] shadow-sm"
                      : "text-[#475569] hover:bg-white hover:text-[#2563EB]"
                  }`}
                >
                  <span>{role.label}</span>
                  {currentRole === role.id && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

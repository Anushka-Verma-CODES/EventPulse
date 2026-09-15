import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

interface UserMenuProps {
  name: string;
  email: string;
  initials: string;
  profileRoute: string;
  settingsRoute: string;
}

export default function UserMenu({ name, email, initials, profileRoute, settingsRoute }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
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
        <ChevronDown className="h-4 w-4 text-[#64748B]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-[#E2E8F0] bg-white py-1.5 shadow-lg">
          <div className="border-b border-[#E2E8F0] px-4 py-2.5">
            <div className="text-sm font-semibold text-[#1E293B]">{name}</div>
            <div className="text-xs text-[#64748B]">{email}</div>
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

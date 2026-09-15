import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar, Check, ChevronDown, LogOut, Repeat2 } from "lucide-react";
import { mockScannerUser, gatesByEvent } from "../../lib/scannerMockData";

type UserRole = "attendee" | "organizer" | "volunteer" | "scanner";

const roleOptions: Array<{ id: UserRole; label: string; route: string }> = [
  { id: "attendee", label: "Attendee", route: "/attendee/dashboard" },
  { id: "organizer", label: "Organizer", route: "/organizer/dashboard" },
  { id: "volunteer", label: "Volunteer", route: "/volunteer/dashboard" },
  { id: "scanner", label: "Scanner", route: "/scanner" },
];

export default function ScannerHeader() {
  const navigate = useNavigate();
  const { eventId, gateId } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const gate = eventId && gateId ? gatesByEvent[eventId]?.find((g) => g.id === gateId) : undefined;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4">
      <Link to="/scanner" className="flex items-center gap-2 hover:opacity-80">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2563EB] text-white">
          <Calendar className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-semibold text-[#1E293B]">EventPulse Scanner</span>
      </Link>

      <div className="flex items-center gap-3">
        {gate && (
          <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#2563EB]">
            {gate.name}
          </span>
        )}

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[#F8FAFC]"
          >
            <span className="hidden text-sm text-[#64748B] sm:inline">{mockScannerUser.name}</span>
            <ChevronDown className="h-4 w-4 text-[#64748B]" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-lg border border-[#E2E8F0] bg-white py-1.5 shadow-lg">
              <div className="border-b border-[#E2E8F0] px-4 py-2.5">
                <div className="text-sm font-semibold text-[#1E293B]">{mockScannerUser.name}</div>
                <div className="text-xs text-[#64748B]">Scanner access</div>
              </div>

              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                <Repeat2 className="h-4 w-4 text-[#64748B]" />
                <span>Switch role</span>
              </button>

              <div className="mx-2 mb-1 rounded-lg bg-[#F8FAFC] p-1">
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(role.route);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs transition-colors ${
                      role.id === "scanner"
                        ? "bg-white font-semibold text-[#2563EB] shadow-sm"
                        : "text-[#475569] hover:bg-white hover:text-[#2563EB]"
                    }`}
                  >
                    <span>{role.label}</span>
                    {role.id === "scanner" && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/login");
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

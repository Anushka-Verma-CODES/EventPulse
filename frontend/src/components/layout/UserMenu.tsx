import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { activateRoleRequest } from "../../lib/authApi";
import type { UserRole } from "../../types/auth";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  Repeat2,
  ShieldCheck,
  X,
} from "lucide-react";

type ActivatableRole = "organizer" | "volunteer" | "scanner";

interface RoleOption {
  id: UserRole;
  label: string;
  route: string;
}

const roleOptions: RoleOption[] = [
  { id: "attendee", label: "Attendee", route: "/attendee/dashboard" },
  { id: "organizer", label: "Organizer", route: "/organizer/dashboard" },
  { id: "volunteer", label: "Volunteer", route: "/volunteer/dashboard" },
  { id: "scanner", label: "Scanner", route: "/scanner/dashboard" },
];

interface UserMenuProps {
  profileRoute: string;
  settingsRoute: string;
  currentRole: UserRole;
}

export default function UserMenu({
  profileRoute,
  settingsRoute,
  currentRole,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [pendingRole, setPendingRole] = useState<ActivatableRole | null>(
    null,
  );

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout, refreshProfile, profile } = useAuth();

  const displayName = profile?.fullName?.trim() || "Account";
  const displayEmail = profile?.email || "";

  const initials =
    displayName === "Account"
      ? "EP"
      : displayName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0].toUpperCase())
          .join("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsRoleMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setIsOpen(false);
    setIsRoleMenuOpen(false);
    setPendingRole(null);
    logout();
    navigate("/login", { replace: true });
  }

  function handleRoleSelection(role: UserRole) {
    if (isSwitchingRole) {
      return;
    }

    if (
      role === "organizer" ||
      role === "volunteer" ||
      role === "scanner"
    ) {
      if (profile?.roles.includes(role)) {
        void switchRole(role);
      } else {
        setPendingRole(role);
      }

      return;
    }

    void switchRole(role);
  }

  async function switchRole(role: UserRole) {
    if (isSwitchingRole) {
      return;
    }

    setIsSwitchingRole(true);

    try {
      if (role !== "attendee" && !profile?.roles.includes(role)) {
        await activateRoleRequest(role);
        await refreshProfile();
      }

      setPendingRole(null);
      setIsOpen(false);
      setIsRoleMenuOpen(false);

      const selectedRole = roleOptions.find(
        (option) => option.id === role,
      );

      if (selectedRole) {
        navigate(selectedRole.route);
      }
    } catch (error) {
      console.error("Failed to switch role:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to switch role. Please try again.",
      );
    } finally {
      setIsSwitchingRole(false);
    }
  }

  function cancelRoleActivation() {
    if (isSwitchingRole) {
      return;
    }

    setPendingRole(null);
  }

  const confirmationDetails: Record<
    ActivatableRole,
    {
      title: string;
      description: string;
      confirmLabel: string;
    }
  > = {
    organizer: {
      title: "Become an Organizer?",
      description:
        "Activate your Organizer role to create, manage, and publish events on EventPulse.",
      confirmLabel: "Activate Organizer",
    },
    volunteer: {
      title: "Become a Volunteer?",
      description:
        "Activate your Volunteer role to help manage events and support event organizers on EventPulse.",
      confirmLabel: "Activate Volunteer",
    },
    scanner: {
      title: "Become a Scanner?",
      description:
        "Activate your Scanner role to scan tickets after an organizer assigns you to an event. This does not grant access to every event.",
      confirmLabel: "Activate Scanner",
    },
  };

  const confirmation = pendingRole
    ? confirmationDetails[pendingRole]
    : null;

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Open account menu"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[#F8FAFC]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
            {initials}
          </span>

          <span className="hidden font-medium text-[#1E293B] sm:inline">
            {displayName.split(/\s+/)[0]}
          </span>

          <ChevronDown className="h-4 w-4 text-[#64748B]" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-lg border border-[#E2E8F0] bg-white py-1.5 shadow-lg">
            <div className="border-b border-[#E2E8F0] px-4 py-2.5">
              <div className="text-sm font-semibold text-[#1E293B]">
                {displayName}
              </div>
              <div className="break-all text-xs text-[#64748B]">
                {displayEmail}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsRoleMenuOpen(false);
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
                setIsRoleMenuOpen(false);
                navigate(settingsRoute);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              <Settings className="h-4 w-4 text-[#64748B]" />
              Settings
            </button>

            <button
              type="button"
              onClick={() => setIsRoleMenuOpen((open) => !open)}
              disabled={isSwitchingRole}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#1E293B] hover:bg-[#F8FAFC] disabled:cursor-wait disabled:opacity-60"
            >
              <Repeat2 className="h-4 w-4 text-[#64748B]" />
              <span>Switch role</span>

              <ChevronDown
                className={`ml-auto h-4 w-4 text-[#64748B] transition-transform ${
                  isRoleMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isRoleMenuOpen && (
              <div className="mx-2 mb-1 rounded-lg bg-[#F8FAFC] p-1">
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    disabled={isSwitchingRole}
                    onClick={() => handleRoleSelection(role.id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-xs transition-colors disabled:cursor-wait disabled:opacity-60 ${
                      currentRole === role.id
                        ? "bg-white font-semibold text-[#2563EB] shadow-sm"
                        : "text-[#475569] hover:bg-white hover:text-[#2563EB]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {role.id === "scanner" && (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      {role.label}
                    </span>

                    {currentRole === role.id && (
                      <Check className="h-3.5 w-3.5" />
                    )}
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

      {pendingRole && confirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4 pt-32 sm:pt-40"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !isSwitchingRole) {
              cancelRoleActivation();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-confirmation-title"
            className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <ShieldCheck className="h-6 w-6 text-[#2563EB]" />
              </div>

              <button
                type="button"
                onClick={cancelRoleActivation}
                disabled={isSwitchingRole}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2
              id="role-confirmation-title"
              className="text-xl font-semibold text-[#0F172A]"
            >
              {confirmation.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              {confirmation.description}
            </p>

            <p className="mt-3 text-xs leading-5 text-[#64748B]">
              You can continue using your Attendee role whenever you want.
              Activating this role adds it to your account.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelRoleActivation}
                disabled={isSwitchingRole}
                className="rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:cursor-wait disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void switchRole(pendingRole)}
                disabled={isSwitchingRole}
                className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-wait disabled:opacity-60"
              >
                {isSwitchingRole
                  ? "Activating..."
                  : confirmation.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
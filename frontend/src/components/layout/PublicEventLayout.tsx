
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import EventAttendeeLayout from "./EventAttendeeLayout";

interface PublicEventLayoutProps {
  children: React.ReactNode;
}

export default function PublicEventLayout({
  children,
}: PublicEventLayoutProps) {
  const { profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && profile?.roles.includes("attendee")) {
    return (
      <EventAttendeeLayout pageTitle="Explore Events">
        {children}
      </EventAttendeeLayout>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white">
              EP
            </span>
            <span className="text-lg font-bold text-[#1E293B]">
              EventPulse
            </span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/"
              className="hidden text-sm font-medium text-[#475569] hover:text-[#2563EB] sm:block"
            >
              Home
            </Link>

            <Link
              to="/events"
              className="text-sm font-semibold text-[#2563EB]"
            >
              Explore Events
            </Link>

            <Link
              to="/login"
              className="text-sm font-medium text-[#475569] hover:text-[#2563EB]"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

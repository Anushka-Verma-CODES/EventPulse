import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AttendeeSidebar from "./AttendeeSidebar";
import AttendeeNavbar from "./AttendeeNavbar";
import MobileSidebar from "./MobileSidebar";

const pageTitles: Record<string, string> = {
  "/attendee/dashboard": "Dashboard",
  "/attendee/tickets": "My Tickets",
  "/attendee/notifications": "Notifications",
  "/attendee/profile": "Profile",
};

export default function AttendeeLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = location.pathname.startsWith("/attendee/tickets/")
    ? "Ticket Details"
    : pageTitles[location.pathname] ?? "Dashboard";

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <div className="hidden lg:block">
        <AttendeeSidebar />
      </div>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AttendeeNavbar
          pageTitle={pageTitle}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

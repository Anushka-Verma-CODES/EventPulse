import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import OrganizerSidebar from "./OrganizerSidebar";
import OrganizerNavbar from "./OrganizerNavbar";
import OrganizerMobileSidebar from "./OrganizerMobileSidebar";

const pageTitles: Record<string, string> = {
  "/organizer/dashboard": "Dashboard",
  "/organizer/events": "My Events",
  "/organizer/attendees": "Attendees",
  "/organizer/monitoring": "Live Monitoring",
  "/organizer/volunteers": "Volunteers",
  "/organizer/resources": "Resources",
  "/organizer/incidents": "Incidents",
  "/organizer/predictions": "Predictions",
  "/organizer/reports": "Reports",
  "/organizer/notifications": "Notifications",
  "/organizer/profile": "Profile",
  "/organizer/settings": "Settings",
};

export default function OrganizerLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? "Dashboard";

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <div className="hidden lg:block">
        <OrganizerSidebar />
      </div>

      <OrganizerMobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <OrganizerNavbar
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

import { useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import VolunteerSidebar from "./VolunteerSidebar";
import VolunteerNavbar from "./VolunteerNavbar";
import VolunteerMobileSidebar from "./VolunteerMobileSidebar";

const staticTitles: Record<string, string> = {
  "/volunteer/dashboard": "Dashboard",
  "/volunteer/opportunities": "Volunteer Opportunities",
  "/volunteer/applications": "My Applications",
  "/volunteer/shifts": "My Shifts",
  "/volunteer/tasks": "My Tasks",
  "/volunteer/notifications": "Notifications",
  "/volunteer/profile": "Profile",
  "/volunteer/settings": "Settings",
};

export default function VolunteerLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const params = useParams();

  let pageTitle = staticTitles[location.pathname];
  if (!pageTitle) {
    if (params.opportunityId) pageTitle = "Opportunity Details";
    else if (params.shiftId) pageTitle = "Shift Details";
    else pageTitle = "Dashboard";
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <div className="hidden lg:block">
        <VolunteerSidebar />
      </div>

      <VolunteerMobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <VolunteerNavbar
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

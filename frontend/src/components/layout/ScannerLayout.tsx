import { Outlet } from "react-router-dom";
import { ScannerProvider } from "../../context/ScannerContext";

// Deliberately NOT reusing AttendeeLayout/OrganizerLayout/VolunteerLayout here.
// The scanner is a fast, single-purpose tool for gate staff - no sidebar,
// no nav menu, just the current screen. See ScannerTopBar for the shared header.
export function ScannerLayout() {
  return (
    <ScannerProvider>
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    </ScannerProvider>
  );
}

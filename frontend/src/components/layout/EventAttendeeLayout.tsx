
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AttendeeNavbar from "./AttendeeNavbar";
import AttendeeSidebar from "./AttendeeSidebar";
import MobileSidebar from "./MobileSidebar";

interface EventAttendeeLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function EventAttendeeLayout({
  children,
  pageTitle,
}: EventAttendeeLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <div className="hidden h-full lg:block">
        <AttendeeSidebar />
      </div>

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AttendeeNavbar
          pageTitle={pageTitle}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main
          ref={mainRef}
          className="min-w-0 flex-1 overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

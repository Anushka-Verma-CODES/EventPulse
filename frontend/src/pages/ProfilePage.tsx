import { useState } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInformation from "../components/profile/PersonalInformation";
import SecuritySection from "../components/profile/SecuritySection";
import NotificationPreferences from "../components/profile/NotificationPreferences";
import PreferencesSection from "../components/profile/PreferencesSection";
import AccountSection from "../components/profile/AccountSection";
import AttendeeSection from "../components/profile/AttendeeSection";
import VolunteerSection from "../components/profile/VolunteerSection";
import OrganizerSection from "../components/profile/OrganizerSection";
import ScannerSection from "../components/profile/ScannerSection";
import {
  personalInfoByRole,
  initialsByRole,
  notificationTogglesByRole,
} from "../lib/profileMockData";
import type { PersonalInfo, ProfileRole } from "../lib/profileMockData";

interface ProfilePageProps {
  role: ProfileRole;
}

// One shared Profile page for all four roles — only the role-specific
// section (and notification list) changes. Deliberately not four
// separate themed pages, per the "one EventPulse, not four websites"
// design rule.
export default function ProfilePage({ role }: ProfilePageProps) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(personalInfoByRole[role]);

  const RoleSection = {
    attendee: AttendeeSection,
    volunteer: VolunteerSection,
    organizer: OrganizerSection,
    scanner: ScannerSection,
  }[role];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-bold text-[#1E293B]">Profile</h1>

      <ProfileHeader
        role={role}
        info={personalInfo}
        initials={initialsByRole[role]}
        onEditClick={() => {
          const el = document.getElementById("personal-information");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <div id="personal-information">
        <PersonalInformation info={personalInfo} onSave={setPersonalInfo} />
      </div>

      <RoleSection />

      <SecuritySection />
      <NotificationPreferences items={notificationTogglesByRole[role]} />
      <PreferencesSection showScannerPreferences={role === "scanner"} />
      <AccountSection role={role} />
    </div>
  );
}

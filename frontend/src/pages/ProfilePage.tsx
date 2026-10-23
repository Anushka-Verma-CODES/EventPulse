import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInformation from "../components/profile/PersonalInformation";
import AttendeeSection from "../components/profile/AttendeeSection";
import VolunteerSection from "../components/profile/VolunteerSection";
import OrganizerSection from "../components/profile/OrganizerSection";
import ScannerSection from "../components/profile/ScannerSection";
import type { PersonalInfo, ProfileRole } from "../lib/profileMockData";

interface ProfilePageProps {
  role: ProfileRole;
}

export default function ProfilePage({ role }: ProfilePageProps) {
  const { profile } = useAuth();

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: profile?.fullName ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    organization: "",
  });

  useEffect(() => {
    setPersonalInfo((current) => ({
      ...current,
      fullName: profile?.fullName ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
    }));
  }, [profile?.fullName, profile?.email, profile?.phone]);

  const RoleSection = {
    attendee: AttendeeSection,
    volunteer: VolunteerSection,
    organizer: OrganizerSection,
    scanner: ScannerSection,
  }[role];

  const initials = personalInfo.fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-bold text-[#1E293B]">Profile</h1>

      <ProfileHeader
        role={role}
        info={personalInfo}
        initials={initials || "U"}
        onEditClick={() => {
          const element = document.getElementById("personal-information");
          element?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />

      <div id="personal-information">
        <PersonalInformation
          info={personalInfo}
          onSave={setPersonalInfo}
        />
      </div>

      <RoleSection />
    </div>
  );
}

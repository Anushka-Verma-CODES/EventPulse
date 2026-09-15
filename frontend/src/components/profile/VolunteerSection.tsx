import { useState } from "react";
import StatGrid from "./StatGrid";
import {
  attendeeAcademicInfo,
  volunteerActivityStats,
  volunteerSkillsList,
  volunteerPreferredRoles,
  volunteerAvailability,
  volunteerCertificates,
} from "../../lib/profileMockData";

export default function VolunteerSection() {
  const [availability, setAvailability] = useState(volunteerAvailability);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);

  function toggleAvailability(label: string) {
    setAvailability((prev) =>
      prev.map((a) => (a.label === label ? { ...a, checked: !a.checked } : a))
    );
  }

  return (
    <>
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1E293B]">Volunteer Information</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-[#64748B]">Student ID</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{attendeeAcademicInfo.studentId}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Department</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{attendeeAcademicInfo.department}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Year</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">{attendeeAcademicInfo.year}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Volunteer Activity</h2>
        <StatGrid stats={volunteerActivityStats} />
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-[#1E293B]">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {volunteerSkillsList.map((skill) => (
            <span key={skill} className="rounded-full bg-[#F8FAFC] px-3 py-1 text-sm text-[#1E293B]">
              {skill}
            </span>
          ))}
        </div>
        <button className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]">
          Edit Skills
        </button>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-[#1E293B]">Preferred Roles</h2>
        <ul className="flex flex-col gap-1.5 text-sm text-[#1E293B]">
          {volunteerPreferredRoles.map((role) => (
            <li key={role}>&#10003; {role}</li>
          ))}
        </ul>
        <button className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]">
          Edit Preferences
        </button>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-[#1E293B]">Availability</h2>
        <div className="flex flex-col gap-2">
          {availability.map((item) => (
            <label key={item.label} className="flex items-center gap-2 text-sm text-[#1E293B]">
              <input
                type="checkbox"
                checked={item.checked}
                disabled={!isEditingAvailability}
                onChange={() => toggleAvailability(item.label)}
                className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {item.label}
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsEditingAvailability((v) => !v)}
          className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          {isEditingAvailability ? "Done" : "Edit Availability"}
        </button>
      </div>

      {volunteerCertificates.length > 0 && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-[#1E293B]">Certificates</h2>
          {volunteerCertificates.map((cert) => (
            <div key={cert.event} className="flex items-center justify-between text-sm">
              <div>
                <div className="font-medium text-[#1E293B]">{cert.event}</div>
                <div className="text-[#64748B]">
                  {cert.title} &bull; Issued: {cert.issuedOn}
                </div>
              </div>
              <button className="text-xs font-medium text-[#2563EB] hover:underline">
                View Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

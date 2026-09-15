import { useState } from "react";
import { Link } from "react-router-dom";
import StatGrid from "./StatGrid";
import {
  attendeeAcademicInfo,
  attendeeActivityStats,
  attendeeUpcomingEvent,
  attendeeInterestCategories,
} from "../../lib/profileMockData";

export default function AttendeeSection() {
  const [categories, setCategories] = useState(attendeeInterestCategories);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);

  function toggleCategory(label: string) {
    setCategories((prev) =>
      prev.map((c) => (c.label === label ? { ...c, checked: !c.checked } : c))
    );
  }

  return (
    <>
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1E293B]">Attendee Information</h2>
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
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Your Event Activity</h2>
        <StatGrid stats={attendeeActivityStats} />
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Upcoming Event</h2>
        <div className="text-base font-medium text-[#1E293B]">{attendeeUpcomingEvent.name}</div>
        <div className="mt-1 text-sm text-[#64748B]">
          {attendeeUpcomingEvent.date} &bull; {attendeeUpcomingEvent.venue}
        </div>
        <div className="mt-1 text-sm text-[#64748B]">
          Ticket: {attendeeUpcomingEvent.ticket} &bull; Status: {attendeeUpcomingEvent.status}
        </div>
        <Link
          to="/attendee/tickets"
          className="mt-3 inline-block rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          View Ticket
        </Link>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">Event Preferences</h2>
        <div className="text-xs text-[#64748B]">Interested Categories</div>
        <div className="mt-2 flex flex-col gap-2">
          {categories.map((category) => (
            <label key={category.label} className="flex items-center gap-2 text-sm text-[#1E293B]">
              <input
                type="checkbox"
                checked={category.checked}
                disabled={!isEditingPreferences}
                onChange={() => toggleCategory(category.label)}
                className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {category.label}
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsEditingPreferences((v) => !v)}
          className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          {isEditingPreferences ? "Done" : "Edit Preferences"}
        </button>
      </div>
    </>
  );
}

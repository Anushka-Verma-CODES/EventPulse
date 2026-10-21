import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatGrid from "./StatGrid";
import {
  attendeeAcademicInfo,
  attendeeInterestCategories,
} from "../../lib/profileMockData";
import { getMyRegistrations } from "../../features/events/api/eventsApi";
import type { MyRegistration } from "../../features/events/api/eventsApi";

export default function AttendeeSection() {
  const [categories, setCategories] = useState(attendeeInterestCategories);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRegistrations() {
      try {
        const data = await getMyRegistrations();

        if (isMounted) {
          setRegistrations(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your event activity."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRegistrations();

    return () => {
      isMounted = false;
    };
  }, []);

  function toggleCategory(label: string) {
    setCategories((prev) =>
      prev.map((category) =>
        category.label === label
          ? { ...category, checked: !category.checked }
          : category
      )
    );
  }

  const now = new Date();

  const upcomingRegistrations = registrations
    .filter(
      (registration) =>
        new Date(registration.event.startDate).getTime() >= now.getTime()
    )
    .sort(
      (a, b) =>
        new Date(a.event.startDate).getTime() -
        new Date(b.event.startDate).getTime()
    );

  const checkedInCount = registrations.filter(
    (registration) => registration.isCheckedIn
  ).length;

  const activityStats = [
  {
    label: "Registered Events",
    value: String(registrations.length),
  },
  {
    label: "Upcoming Events",
    value: String(upcomingRegistrations.length),
  },
  {
    label: "Events Attended",
    value: String(checkedInCount),
  },
];

  const nextEvent = upcomingRegistrations[0];

  return (
    <>
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1E293B]">
          Attendee Information
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-[#64748B]">Student ID</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">
              {attendeeAcademicInfo.studentId}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#64748B]">Department</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">
              {attendeeAcademicInfo.department}
            </div>
          </div>

          <div>
            <div className="text-xs text-[#64748B]">Year</div>
            <div className="mt-1 text-sm font-medium text-[#1E293B]">
              {attendeeAcademicInfo.year}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">
          Your Event Activity
        </h2>

        {loading ? (
          <p className="text-sm text-[#64748B]">
            Loading your event activity...
          </p>
        ) : error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : (
          <StatGrid stats={activityStats} />
        )}
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">
          Upcoming Event
        </h2>

        {loading ? (
          <p className="text-sm text-[#64748B]">
            Loading your upcoming events...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">
            Upcoming event information is unavailable.
          </p>
        ) : nextEvent ? (
          <>
            <div className="text-base font-medium text-[#1E293B]">
              {nextEvent.event.title}
            </div>

            <div className="mt-1 text-sm text-[#64748B]">
              {new Date(nextEvent.event.startDate).toLocaleString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: "Asia/Kolkata",
              })}
              {" • "}
              {nextEvent.event.location}
            </div>

            <div className="mt-1 text-sm text-[#64748B]">
              Category: {nextEvent.event.category}
              {" • "}
              Status:{" "}
              {nextEvent.isCheckedIn
                ? "Checked In"
                : "Registration Confirmed"}
            </div>

            <Link
              to={`/attendee/tickets/${nextEvent.id}`}
              className="mt-3 inline-block rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              View Ticket
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-[#64748B]">
              You don't have any upcoming registered events.
            </p>

            <Link
              to="/events"
              className="mt-3 inline-block text-sm font-medium text-[#2563EB] hover:underline"
            >
              Browse events →
            </Link>
          </>
        )}
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1E293B]">
          Event Preferences
        </h2>

        <div className="text-xs text-[#64748B]">
          Interested Categories
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {categories.map((category) => (
            <label
              key={category.label}
              className="flex items-center gap-2 text-sm text-[#1E293B]"
            >
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
          onClick={() => setIsEditingPreferences((value) => !value)}
          className="mt-3 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          {isEditingPreferences ? "Done" : "Edit Preferences"}
        </button>
      </div>
    </>
  );
}

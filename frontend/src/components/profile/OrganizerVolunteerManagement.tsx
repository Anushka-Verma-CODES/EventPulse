import { useEffect, useState } from "react";
import {
  createVolunteerAssignment,
  getEligibleVolunteers,
} from "../../features/volunteers/api/volunteersApi";
import type { EligibleVolunteer } from "../../features/volunteers/api/volunteersApi";
import { getMyEvents } from "../../features/events/api/eventsApi";

type OrganizerEvent = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "draft" | "published" | "cancelled";
};

const volunteerRoles = [
  "Gate Management",
  "Registration Desk",
  "Crowd Management",
  "Event Coordination",
  "Technical Support",
  "Guest Assistance",
];

export default function OrganizerVolunteerManagement() {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [volunteers, setVolunteers] = useState<EligibleVolunteer[]>([]);
  const [eventId, setEventId] = useState("");
  const [volunteerId, setVolunteerId] = useState("");
  const [assignedRole, setAssignedRole] = useState(volunteerRoles[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [myEvents, eligibleVolunteers] = await Promise.all([
          getMyEvents(),
          getEligibleVolunteers(),
        ]);

        if (!active) return;

        setEvents(myEvents);
        setVolunteers(eligibleVolunteers);

        if (myEvents.length > 0) {
          setEventId(myEvents[0].id);
        }

        if (eligibleVolunteers.length > 0) {
          setVolunteerId(eligibleVolunteers[0].id);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load events and volunteers.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  async function handleAssign() {
    setError("");
    setSuccess("");

    if (!eventId || !volunteerId || !assignedRole) {
      setError("Select an event, a volunteer, and an assignment role.");
      return;
    }

    setSubmitting(true);

    try {
      await createVolunteerAssignment({
        eventId,
        volunteerId,
        assignedRole,
      });

      const selectedVolunteer = volunteers.find(
        (volunteer) => volunteer.id === volunteerId,
      );

      setSuccess(
        `Successfully assigned ${selectedVolunteer?.fullName ?? "the volunteer"} to the event.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the volunteer assignment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-[#1E293B]">
          Volunteer Management
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Assign volunteers to events you organize and give them clear responsibilities.
        </p>
      </div>

      {loading ? (
        <p className="mt-5 text-sm text-[#64748B]">
          Loading your events and eligible volunteers...
        </p>
      ) : (
        <>
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="volunteer-event"
                className="mb-2 block text-sm font-medium text-[#334155]"
              >
                Select Event
              </label>
              <select
                id="volunteer-event"
                value={eventId}
                onChange={(event) => setEventId(event.target.value)}
                disabled={events.length === 0}
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#64748B]"
              >
                {events.length === 0 ? (
                  <option value="">No events found</option>
                ) : (
                  events.map((event) => (
                    <option
                      key={event.id}
                      value={event.id}
                      disabled={event.status === "cancelled"}
                    >
                      {event.title}
                      {event.status === "cancelled" ? " (Cancelled)" : ""}
                    </option>
                  ))
                )}
              </select>
              {events.length === 0 && (
                <p className="mt-1 text-xs text-[#64748B]">
                  Create an event before assigning volunteers.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="eligible-volunteer"
                className="mb-2 block text-sm font-medium text-[#334155]"
              >
                Select Volunteer
              </label>
              <select
                id="eligible-volunteer"
                value={volunteerId}
                onChange={(event) => setVolunteerId(event.target.value)}
                disabled={volunteers.length === 0}
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#64748B]"
              >
                {volunteers.length === 0 ? (
                  <option value="">No eligible volunteers found</option>
                ) : (
                  volunteers.map((volunteer) => (
                    <option key={volunteer.id} value={volunteer.id}>
                      {volunteer.fullName} ({volunteer.email})
                    </option>
                  ))
                )}
              </select>
              {volunteers.length === 0 && (
                <p className="mt-1 text-xs text-[#64748B]">
                  Users must activate the Volunteer role before they can be assigned.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="volunteer-assigned-role"
                className="mb-2 block text-sm font-medium text-[#334155]"
              >
                Responsibility
              </label>
              <select
                id="volunteer-assigned-role"
                value={assignedRole}
                onChange={(event) => setAssignedRole(event.target.value)}
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#64748B]"
              >
                {volunteerRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleAssign()}
            disabled={
              submitting ||
              !eventId ||
              !volunteerId ||
              events.every((event) => event.status === "cancelled")
            }
            className="mt-5 rounded-lg bg-[#1E293B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#334155] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Assigning..." : "Assign Volunteer"}
          </button>
        </>
      )}
    </section>
  );
}
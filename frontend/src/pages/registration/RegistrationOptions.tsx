import { Link } from "react-router-dom";
import { getAttendeeRegistration, getVolunteerApplication } from "../../lib/registrationMockData";

interface RegistrationOptionsProps {
  eventId: string;
}

export default function RegistrationOptions({ eventId }: RegistrationOptionsProps) {
  const attendeeReg = getAttendeeRegistration(eventId);
  const volunteerApp = getVolunteerApplication(eventId);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1E293B]">How would you like to participate?</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Attendee card */}
        <div className="rounded-xl border border-[#E2E8F0] p-5">
          <div className="text-2xl">&#127903;&#65039;</div>
          <h3 className="mt-2 text-base font-semibold text-[#1E293B]">Attend this event</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Purchase a ticket and get your QR entry pass.
          </p>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-[#64748B]">
            <li>&#10003; Access to the event</li>
            <li>&#10003; Digital QR ticket</li>
            <li>&#10003; Secure ticket validation</li>
            <li>&#10003; Ticket transfer option</li>
          </ul>

          {attendeeReg ? (
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-[#16A34A]">
                &#10003; Registered as Attendee
              </div>
              <Link
                to="/attendee/tickets"
                className="block rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                View Ticket
              </Link>
            </div>
          ) : (
            <Link
              to={`/events/${eventId}/register/attendee`}
              className="mt-4 block rounded-lg bg-[#2563EB] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Register as Attendee
            </Link>
          )}
        </div>

        {/* Volunteer card */}
        <div className="rounded-xl border border-[#E2E8F0] p-5">
          <div className="text-2xl">&#129309;</div>
          <h3 className="mt-2 text-base font-semibold text-[#1E293B]">Volunteer at this event</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Apply for available volunteer roles. Free to apply.
          </p>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-[#64748B]">
            <li>&#10003; Choose volunteer opportunities</li>
            <li>&#10003; Get assigned shifts</li>
            <li>&#10003; Manage event tasks</li>
            <li>&#10003; Receive volunteer record</li>
          </ul>

          <div className="mt-3 text-xs font-medium text-[#64748B]">
            No registration fee &middot; Application required
          </div>

          {volunteerApp ? (
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-[#D97706]">
                &#10003; Volunteer Application {volunteerApp.status === "Pending" ? "Submitted" : volunteerApp.status}
              </div>
              <Link
                to="/volunteer/applications"
                className="block rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
              >
                View Application
              </Link>
            </div>
          ) : (
            <Link
              to={`/events/${eventId}/register/volunteer`}
              className="mt-4 block rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-center text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              Register as Volunteer
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link, useParams, Navigate } from "react-router-dom";
import { mockEventDetail, getAttendeeRegistration } from "../../lib/registrationMockData";

export default function RegistrationSuccess() {
  const { eventId } = useParams();
  const registration = eventId ? getAttendeeRegistration(eventId) : null;

  if (!registration || !eventId) return <Navigate to={`/events/${eventId ?? ""}`} replace />;

  const event = mockEventDetail;

  return (
    <div className="mx-auto max-w-md px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4] text-3xl text-[#16A34A]">
        &#10003;
      </div>
      <h1 className="mt-4 text-2xl font-bold text-[#1E293B]">Registration Successful</h1>
      <p className="mt-1 text-sm text-[#64748B]">You&apos;re registered for {event.name}</p>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 text-left shadow-sm">
        <div className="text-sm text-[#64748B]">{event.date}</div>
        <div className="text-sm text-[#64748B]">{event.time}</div>
        <div className="text-sm text-[#64748B]">{event.venue}</div>

        <div className="mt-3 flex justify-between border-t border-[#E2E8F0] pt-3 text-sm">
          <span className="text-[#64748B]">Ticket ID</span>
          <span className="font-medium text-[#1E293B]">{registration.ticketId}</span>
        </div>
        <div className="mt-1.5 flex justify-between text-sm">
          <span className="text-[#64748B]">Payment</span>
          <span className="font-medium text-[#1E293B]">
            {registration.amountPaid === 0 ? "Free" : `\u20B9${registration.amountPaid} \u2022 Paid`}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#64748B]">
        Your official QR ticket has been generated.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          to="/attendee/tickets"
          className="rounded-lg bg-[#2563EB] py-3 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          View My Ticket
        </Link>
        <Link
          to="/attendee/tickets"
          className="rounded-lg border border-[#E2E8F0] bg-white py-3 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          Go to My Tickets
        </Link>
      </div>
    </div>
  );
}

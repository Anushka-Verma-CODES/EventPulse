import { Link, useParams, Navigate } from "react-router-dom";
import { mockEventDetail, getVolunteerApplication } from "../../lib/registrationMockData";

export default function VolunteerApplicationSuccess() {
  const { eventId } = useParams();
  const application = eventId ? getVolunteerApplication(eventId) : null;

  if (!application || !eventId) return <Navigate to={`/events/${eventId ?? ""}`} replace />;

  return (
    <div className="mx-auto max-w-md px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4] text-3xl text-[#16A34A]">
        &#10003;
      </div>
      <h1 className="mt-4 text-2xl font-bold text-[#1E293B]">Application Submitted</h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Your volunteer application for {mockEventDetail.name} has been submitted.
      </p>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 text-left shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">Application ID</span>
          <span className="font-medium text-[#1E293B]">{application.applicationId}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="text-[#64748B]">Status</span>
          <span className="flex items-center gap-1.5 font-medium text-[#D97706]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" /> Pending Review
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#64748B]">
        The organizer will review your application and notify you about the result.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          to="/volunteer/applications"
          className="rounded-lg bg-[#2563EB] py-3 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          View My Applications
        </Link>
        <Link
          to="/volunteer/dashboard"
          className="rounded-lg border border-[#E2E8F0] bg-white py-3 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

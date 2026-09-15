import { useNavigate, useLocation, useParams, Navigate } from "react-router-dom";
import RegistrationStepper from "../../components/registration/RegistrationStepper";
import { mockEventDetail, volunteerShiftOptions, submitVolunteerApplication } from "../../lib/registrationMockData";

const steps = ["Details", "Review", "Submitted"];

interface LocationState {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  studentId: string;
  roles: string[];
  shiftIds: string[];
  skills: string;
  experience: string;
  reason: string;
}

export default function VolunteerReview() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state || !eventId) return <Navigate to={`/events/${eventId ?? ""}`} replace />;

  const selectedShifts = volunteerShiftOptions.filter((s) => state.shiftIds.includes(s.id));

  function handleSubmitApplication() {
    submitVolunteerApplication(eventId!);
    navigate(`/events/${eventId}/volunteer/application-success`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <RegistrationStepper steps={steps} currentStep={2} />

      <h1 className="mt-8 text-2xl font-bold text-[#1E293B]">Application Summary</h1>
      <p className="text-sm text-[#64748B]">{mockEventDetail.name}</p>

      <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1E293B]">Personal Details</h2>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-medium text-[#2563EB] hover:underline"
          >
            Edit
          </button>
        </div>
        <p className="mt-1 text-sm text-[#1E293B]">{state.fullName}</p>
        {state.college && <p className="text-sm text-[#64748B]">{state.college}</p>}
        <p className="text-sm text-[#64748B]">{state.email} &bull; {state.phone}</p>

        <h2 className="mt-5 text-sm font-semibold text-[#1E293B]">Preferred Roles</h2>
        <ul className="mt-1 flex flex-col gap-1 text-sm text-[#64748B]">
          {state.roles.map((role) => (
            <li key={role}>&#10003; {role}</li>
          ))}
        </ul>

        {selectedShifts.length > 0 && (
          <>
            <h2 className="mt-5 text-sm font-semibold text-[#1E293B]">Availability</h2>
            <ul className="mt-1 flex flex-col gap-1 text-sm text-[#64748B]">
              {selectedShifts.map((shift) => (
                <li key={shift.id}>&#10003; {shift.label}</li>
              ))}
            </ul>
          </>
        )}

        {state.experience && (
          <>
            <h2 className="mt-5 text-sm font-semibold text-[#1E293B]">Experience</h2>
            <p className="mt-1 text-sm text-[#64748B]">{state.experience}</p>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmitApplication}
        className="mt-6 w-full rounded-lg bg-[#2563EB] py-3 text-sm font-medium text-white hover:bg-[#1D4ED8]"
      >
        Submit Volunteer Application
      </button>
    </div>
  );
}

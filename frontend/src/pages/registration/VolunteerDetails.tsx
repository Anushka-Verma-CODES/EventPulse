import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RegistrationStepper from "../../components/registration/RegistrationStepper";
import { mockEventDetail, volunteerRoleOptions, volunteerShiftOptions } from "../../lib/registrationMockData";

const steps = ["Details", "Review", "Submitted"];

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  roles?: string;
}

export default function VolunteerDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [studentId, setStudentId] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [shiftIds, setShiftIds] = useState<string[]>([]);
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  function toggleShift(id: string) {
    setShiftIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      fullName: fullName.trim() ? undefined : "Please enter your full name.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Please enter a valid email address.",
      phone: phone.trim() ? undefined : "Please enter a valid phone number.",
      roles: roles.length > 0 ? undefined : "Select at least one preferred role.",
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    navigate(`/events/${eventId}/register/volunteer/review`, {
      state: { fullName, email, phone, college, studentId, roles, shiftIds, skills, experience, reason },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <RegistrationStepper steps={steps} currentStep={1} />

      <h1 className="mt-8 text-2xl font-bold text-[#1E293B]">Volunteer Application</h1>
      <p className="text-sm text-[#64748B]">{mockEventDetail.name}</p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1E293B]">Personal Information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#1E293B]">Full Name *</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
            {errors.fullName && <p className="mt-1 text-xs text-[#DC2626]">{errors.fullName}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-[#1E293B]">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
            {errors.email && <p className="mt-1 text-xs text-[#DC2626]">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-[#1E293B]">Phone *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
            {errors.phone && <p className="mt-1 text-xs text-[#DC2626]">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-[#1E293B]">College / Organization</label>
            <input
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1E293B]">Student ID</label>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold text-[#1E293B]">
          What would you like to help with?
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {volunteerRoleOptions.map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm text-[#1E293B]">
              <input
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() => toggleRole(role)}
                className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {role}
            </label>
          ))}
        </div>
        {errors.roles && <p className="mt-1 text-xs text-[#DC2626]">{errors.roles}</p>}

        <h2 className="mt-6 text-sm font-semibold text-[#1E293B]">Available Shifts</h2>
        <div className="mt-3 flex flex-col gap-2">
          {volunteerShiftOptions.map((shift) => (
            <label
              key={shift.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                shiftIds.includes(shift.id) ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0]"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shiftIds.includes(shift.id)}
                  onChange={() => toggleShift(shift.id)}
                  className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB]"
                />
                {shift.label}
              </span>
              <span className="text-[#64748B]">{shift.role}</span>
            </label>
          ))}
        </div>

        <h2 className="mt-6 text-sm font-semibold text-[#1E293B]">Relevant Skills</h2>
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Communication, event management..."
          className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />

        <h2 className="mt-4 text-sm font-semibold text-[#1E293B]">Previous Volunteer Experience</h2>
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />

        <h2 className="mt-4 text-sm font-semibold text-[#1E293B]">
          Why would you like to volunteer?
        </h2>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-[#2563EB] py-3 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          Continue to Review
        </button>
      </form>
    </div>
  );
}

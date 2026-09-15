import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RegistrationStepper from "../../components/registration/RegistrationStepper";
import { mockEventDetail, ticketCategories, registerAttendee } from "../../lib/registrationMockData";

const steps = ["Personal Details", "Payment", "Confirmation"];

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  category?: string;
  studentId?: string;
}

export default function AttendeeDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = mockEventDetail;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [studentId, setStudentId] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const selectedCategory = ticketCategories.find((c) => c.id === categoryId);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      fullName: fullName.trim() ? undefined : "Please enter your full name.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Please enter a valid email address.",
      phone: phone.trim() ? undefined : "Please enter a valid phone number.",
      category: categoryId ? undefined : "Please select a ticket category.",
      studentId:
        selectedCategory?.requiresStudentId && !studentId.trim()
          ? "Student ID is required for this ticket."
          : undefined,
    };

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setErrors(nextErrors);
      return;
    }

    // Free tickets skip the payment page entirely.
    if (selectedCategory!.price === 0) {
      registerAttendee(eventId!, selectedCategory!);
      navigate(`/events/${eventId}/registration-success`);
      return;
    }

    // Carry the selection forward via navigation state — the payment
    // page reads it back out with useLocation().
    navigate(`/events/${eventId}/register/attendee/payment`, {
      state: { fullName, email, phone, college, categoryId },
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <RegistrationStepper steps={steps} currentStep={1} />

      <h1 className="mt-8 text-2xl font-bold text-[#1E293B]">Register for {event.name}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form id="attendee-details-form" onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1E293B]">Personal Information</h2>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-[#1E293B]">Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {errors.fullName && <p className="mt-1 text-xs text-[#DC2626]">{errors.fullName}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#1E293B]">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {errors.email && <p className="mt-1 text-xs text-[#DC2626]">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#1E293B]">Phone Number *</label>
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
          </div>

          <h2 className="mt-6 text-sm font-semibold text-[#1E293B]">Select Ticket</h2>
          <div className="mt-3 flex flex-col gap-2">
            {ticketCategories.map((category) => (
              <label
                key={category.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                  categoryId === category.id ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryId === category.id}
                    onChange={() => setCategoryId(category.id)}
                    className="h-4 w-4 text-[#2563EB]"
                  />
                  {category.name}
                </span>
                <span className="font-medium text-[#1E293B]">
                  {category.price === 0 ? "Free" : `\u20B9${category.price}`}
                </span>
              </label>
            ))}
          </div>
          {errors.category && <p className="mt-1 text-xs text-[#DC2626]">{errors.category}</p>}

          {selectedCategory?.requiresStudentId && (
            <div className="mt-3">
              <label className="text-sm font-medium text-[#1E293B]">Student / Employee ID</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {errors.studentId && <p className="mt-1 text-xs text-[#DC2626]">{errors.studentId}</p>}
            </div>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-[#2563EB] py-3 text-sm font-medium text-white hover:bg-[#1D4ED8] lg:hidden"
          >
            Continue to Payment
          </button>
        </form>

        <div className="h-fit rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1E293B]">Order Summary</h3>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-[#64748B]">{event.name}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-[#64748B]">{selectedCategory?.name ?? "Select a ticket"}</span>
            <span className="font-medium text-[#1E293B]">
              {selectedCategory ? `\u20B9${selectedCategory.price}` : "\u2014"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-sm font-semibold text-[#1E293B]">
            <span>Total</span>
            <span>{selectedCategory ? `\u20B9${selectedCategory.price}` : "\u20B90"}</span>
          </div>
          <button
            type="submit"
            form="attendee-details-form"
            className="mt-4 hidden w-full rounded-lg bg-[#2563EB] py-3 text-sm font-medium text-white hover:bg-[#1D4ED8] lg:block"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

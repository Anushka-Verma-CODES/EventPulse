import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using EventPulse, you agree to comply with these Terms and Conditions. If you do not agree with these terms, please do not use the platform.",
  },
  {
    title: "2. About EventPulse",
    content:
      "EventPulse is an event management platform that allows users to discover events, register for events, manage tickets, organize events, and participate in volunteer activities.",
  },
  {
    title: "3. User Accounts",
    content:
      "Users are responsible for providing accurate information during registration and maintaining the confidentiality of their account credentials. You are responsible for activities performed through your account.",
  },
  {
    title: "4. User Roles",
    content:
      "EventPulse supports different user roles, including attendees, organizers, volunteers, and scanner staff. Each role has specific permissions and responsibilities within the platform.",
  },
  {
    title: "5. Event Registration",
    content:
      "Users must provide accurate information when registering for events. Registration may be subject to availability, eligibility requirements, and event-specific conditions.",
  },
  {
    title: "6. Payments and Refunds",
    content:
      "Payments made through EventPulse are processed using the available payment gateway. Payment confirmation is subject to successful verification. Refunds, where applicable, are governed by the individual event's refund policy.",
  },
  {
    title: "7. Tickets and Resale",
    content:
      "Tickets issued through EventPulse are intended for the registered attendee. Users participating in ticket resale must follow the platform's resale rules. Misrepresentation, fraudulent listings, or unauthorized ticket transfers are prohibited.",
  },
  {
    title: "8. Organizer Responsibilities",
    content:
      "Organizers are responsible for providing accurate event details, managing registrations, communicating relevant updates, and ensuring that their events comply with applicable laws and regulations.",
  },
  {
    title: "9. Volunteer Participation",
    content:
      "Volunteers must provide accurate application details and follow the instructions and schedules provided by event organizers. Acceptance of a volunteer application is subject to organizer approval.",
  },
  {
    title: "10. Prohibited Activities",
    content:
      "Users must not misuse the platform, submit false information, attempt unauthorized access, manipulate registrations or tickets, distribute malicious content, or interfere with the platform's operation.",
  },
  {
    title: "11. QR Codes and Event Check-in",
    content:
      "EventPulse may issue QR-based tickets for event verification. Users must protect their ticket information. Entry is subject to successful ticket validation and the event organizer's rules.",
  },
  {
    title: "12. Notifications and Communication",
    content:
      "EventPulse may send notifications relating to registrations, payments, event updates, account activity, and other platform-related information.",
  },
  {
    title: "13. Privacy and Data",
    content:
      "Personal information is handled in accordance with our Privacy Policy. Users should provide only accurate information and avoid sharing their account credentials with others.",
  },
  {
    title: "14. Platform Availability",
    content:
      "We aim to keep EventPulse available and functional. However, we do not guarantee uninterrupted access and may temporarily suspend services for maintenance, updates, or technical reasons.",
  },
  {
    title: "15. Limitation of Liability",
    content:
      "EventPulse is a platform connecting users and event organizers. We are not responsible for event cancellations, changes, organizer conduct, or circumstances beyond our reasonable control.",
  },
  {
    title: "16. Account Suspension",
    content:
      "EventPulse reserves the right to restrict or suspend accounts involved in fraudulent, abusive, unlawful, or otherwise prohibited activities.",
  },
  {
    title: "17. Changes to These Terms",
    content:
      "These Terms and Conditions may be updated when necessary. Continued use of EventPulse after changes are published indicates acceptance of the updated terms.",
  },
  {
    title: "18. Contact",
    content:
      "For questions or concerns regarding these Terms and Conditions, please contact the EventPulse team through the available platform communication channels.",
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-5 flex items-center gap-2 text-sm text-[#64748B]">
            <Link to="/" className="transition hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight size={15} />
            <span className="text-[#2563EB]">Terms and Conditions</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <FileText size={25} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">
                EVENTPULSE
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-[#1E293B] sm:text-4xl">
                Terms and Conditions
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#64748B]">
            Please read these terms carefully before using EventPulse. They
            explain the rules and responsibilities associated with using our
            event management platform.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-[#64748B]">
            <span className="flex items-center gap-2">
              <CalendarDays size={16} />
              Last updated: November 2026
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#2563EB]" />
              Platform usage guidelines
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-xl border border-[#E2E8F0] bg-white p-5 lg:sticky lg:top-6">
          <h2 className="mb-4 text-sm font-bold text-[#1E293B]">
            On this page
          </h2>

          <nav className="space-y-2">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index + 1}`}
                className="block rounded-lg px-3 py-2 text-sm text-[#64748B] transition hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-5">
          <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-5">
            <h2 className="font-semibold text-[#1E40AF]">
              Welcome to EventPulse
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              These terms establish the basic rules for using EventPulse as an
              attendee, organizer, volunteer, or scanner staff member.
            </p>
          </div>

          {sections.map((section, index) => (
            <section
              key={index}
              id={`section-${index + 1}`}
              className="scroll-mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-[#1E293B]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#64748B]">
                {section.content}
              </p>
            </section>
          ))}

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <p className="text-sm leading-6 text-[#64748B]">
              By continuing to use EventPulse, you acknowledge that you have
              read and understood these Terms and Conditions.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Back to Home <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
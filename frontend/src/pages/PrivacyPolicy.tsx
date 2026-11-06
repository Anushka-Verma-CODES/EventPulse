import { Link } from "react-router-dom";
import {
  ShieldCheck,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    content:
      "EventPulse respects your privacy. This Privacy Policy explains how we collect, use, store, and protect information when you use our event management platform.",
  },
  {
    title: "2. Information We Collect",
    content:
      "We may collect your name, email address, phone number, account credentials, event registrations, ticket information, payment-related transaction references, and information you provide while using the platform.",
  },
  {
    title: "3. How We Use Your Information",
    content:
      "Your information is used to create and manage accounts, process event registrations, verify tickets, facilitate payments, manage volunteer applications, send notifications, and improve platform functionality.",
  },
  {
    title: "4. Account Information",
    content:
      "You are responsible for maintaining accurate account information and protecting your login credentials. Please notify the EventPulse team if you suspect unauthorized access to your account.",
  },
  {
    title: "5. Event and Ticket Information",
    content:
      "EventPulse processes registration and ticket information to help attendees access events and allow organizers and authorized scanner staff to verify entries.",
  },
  {
    title: "6. Payment Information",
    content:
      "Payments are handled through the integrated payment gateway. EventPulse may retain transaction references and payment status for verification and record-keeping. Your complete payment card or banking credentials are handled by the payment provider.",
  },
  {
    title: "7. Cookies and Session Storage",
    content:
      "EventPulse may use browser storage and similar technologies to maintain login sessions and support essential platform functionality. You can manage browser storage through your browser settings.",
  },
  {
    title: "8. Sharing of Information",
    content:
      "Information may be shared with relevant event organizers, authorized volunteers, scanner staff, and payment service providers when necessary to provide platform services. We do not intend to sell users' personal information.",
  },
  {
    title: "9. Data Security",
    content:
      "We take reasonable measures to protect information against unauthorized access, alteration, disclosure, or destruction. However, no online system can guarantee absolute security.",
  },
  {
    title: "10. Data Retention",
    content:
      "Information is retained for as long as reasonably necessary to provide platform services, maintain transaction records, meet operational requirements, and comply with applicable legal obligations.",
  },
  {
    title: "11. Your Choices and Rights",
    content:
      "You may review and update available account information through your profile and settings. You may also contact the EventPulse team regarding questions or requests relating to your personal information.",
  },
  {
    title: "12. Third-Party Services",
    content:
      "EventPulse may integrate with third-party services such as payment gateways and hosting providers. Their handling of information is governed by their own privacy policies and terms.",
  },
  {
    title: "13. Children's Privacy",
    content:
      "EventPulse is not specifically designed to collect personal information from children without appropriate authorization. Users should comply with applicable age requirements when using the platform.",
  },
  {
    title: "14. Changes to This Policy",
    content:
      "This Privacy Policy may be updated from time to time. Any revised version will be published on this page with an updated revision date.",
  },
  {
    title: "15. Contact Us",
    content:
      "If you have questions or concerns about this Privacy Policy or how your information is handled, please contact the EventPulse team through the available platform communication channels.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-5 flex items-center gap-2 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight size={15} />
            <span className="text-[#2563EB]">Privacy Policy</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <ShieldCheck size={25} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#2563EB]">
                EVENTPULSE
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-[#1E293B] sm:text-4xl">
                Privacy Policy
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#64748B]">
            Your privacy matters to us. Learn how EventPulse handles your
            information while you discover events, manage registrations, and
            use our platform.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-[#64748B]">
            <CalendarDays size={16} />
            Last updated: November 2026
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
                href={`#privacy-${index + 1}`}
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
              Your information, handled responsibly
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              We use information to make event discovery, registration, ticket
              verification, and event management possible.
            </p>
          </div>

          {sections.map((section, index) => (
            <section
              key={index}
              id={`privacy-${index + 1}`}
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
              Thank you for trusting EventPulse with your information.
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
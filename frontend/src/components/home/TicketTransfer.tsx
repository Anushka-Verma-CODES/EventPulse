
import { ticketResaleSteps } from "../../data/homeContent";

export default function TicketTransfer() {
  return (
    <section className="bg-[#EFF6FF] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <span className="text-xs font-semibold tracking-wide text-[#2563EB]">
          TICKET RESALE
        </span>

        <h2 className="mt-2 text-2xl font-bold text-[#1E293B]">
          Have a ticket you can't use?
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          List your eligible event ticket on the EventPulse marketplace.
          Other attendees can discover available listings and purchase
          tickets through the resale checkout.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {ticketResaleSteps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-[#DBEAFE] bg-white p-6"
            >
              <div className="mb-3 text-xs font-semibold text-[#2563EB]">
                {step.number}
              </div>

              <h3 className="mb-1 text-sm font-semibold text-[#1E293B]">
                {step.title}
              </h3>

              <p className="text-sm leading-relaxed text-[#64748B]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-[#64748B]">
          Resale listings cannot exceed the event's original ticket price.
          Payments are processed through the resale checkout.
        </p>
      </div>
    </section>
  );
}

import { ticketTransferSteps } from "../../data/homeContent";

export default function TicketTransfer() {
  return (
    <section className="bg-[#EFF6FF] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-[#1E293B]">
          Tickets that can be transferred safely.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          No need to share screenshots or PDF copies of your QR ticket. Transfer your
          ticket officially through EventPulse.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {ticketTransferSteps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-[#DBEAFE] bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 text-xs font-semibold text-[#2563EB]">{step.number}</div>
              <div className="mb-1 text-sm font-semibold text-[#1E293B]">{step.title}</div>
              <p className="text-sm leading-relaxed text-[#64748B]">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-[#FEE2E2] px-3 py-1 font-medium text-[#DC2626]">
            Original ticket &rarr; TRANSFERRED
          </span>
          <span className="rounded-full bg-[#DCFCE7] px-3 py-1 font-medium text-[#16A34A]">
            New ticket &rarr; ACTIVE
          </span>
        </div>
      </div>
    </section>
  );
}

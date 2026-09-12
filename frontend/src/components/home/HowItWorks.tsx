import { howItWorksSteps } from "../../data/homeContent";

export default function HowItWorks() {
  return (
    <section className="bg-[#EFF6FF] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-[#1E293B]">Everything you need, in one place.</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {howItWorksSteps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-[#DBEAFE] bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 text-xs font-semibold text-[#2563EB]">{step.number}</div>
              <div className="mb-4 text-lg font-semibold text-[#1E293B]">{step.label}</div>
              <ul className="flex flex-col gap-2 text-sm text-[#64748B]">
                {step.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

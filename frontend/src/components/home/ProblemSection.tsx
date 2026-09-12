import { problems } from "../../data/homeContent";

export default function ProblemSection() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-[#1E293B]">
          Event management shouldn&apos;t be complicated.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          Events are often managed using forms, spreadsheets, messaging groups and manual
          attendance lists. EventPulse brings these activities together into one platform.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem) => (
            <div
              key={problem.number}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 text-xs font-semibold text-[#2563EB]">{problem.number}</div>
              <div className="mb-1 text-sm font-semibold text-[#1E293B]">{problem.title}</div>
              <p className="text-sm leading-relaxed text-[#64748B]">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

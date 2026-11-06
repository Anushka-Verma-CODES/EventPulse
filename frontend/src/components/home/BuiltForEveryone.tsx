
import { roles } from "../../data/homeContent";

const roleStyles = [
  {
    number: "01",
    accent: "bg-blue-50 text-blue-700",
    line: "bg-blue-500",
  },
  {
    number: "02",
    accent: "bg-indigo-50 text-indigo-700",
    line: "bg-indigo-500",
  },
  {
    number: "03",
    accent: "bg-sky-50 text-sky-700",
    line: "bg-sky-500",
  },
  {
    number: "04",
    accent: "bg-slate-100 text-slate-700",
    line: "bg-slate-500",
  },
];

export default function BuiltForEveryone() {
  return (
    <section className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Designed for every participant
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1E293B] sm:text-4xl">
              One platform. Different roles.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#64748B]">
              From discovering events to managing entry, everyone gets
              the right tools for their part in the experience.
            </p>
          </div>

          <div className="hidden text-sm font-medium text-[#94A3B8] md:block">
            FOUR ROLES · ONE PLATFORM
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => {
            const style = roleStyles[index % roleStyles.length];

            return (
              <div
                key={role.title}
                className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div
                  className={`absolute left-0 top-0 h-1 w-full ${style.line}`}
                />

                <div className="mb-6 flex items-center justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${style.accent}`}
                  >
                    {style.number}
                  </span>

                  <span className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                    Role
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1E293B]">
                  {role.title}
                </h3>

                <p className="mt-2 min-h-10 text-sm leading-6 text-[#64748B]">
                  {role.tagline}
                </p>

                <div className="my-5 h-px bg-[#E2E8F0]" />

                <ul className="space-y-3">
                  {role.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-5 text-[#475569]"
                    >
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

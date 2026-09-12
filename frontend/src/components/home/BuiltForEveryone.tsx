import { roles } from "../../data/homeContent";

export default function BuiltForEveryone() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-[#1E293B]">One platform. Different roles.</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.title}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-1 text-sm font-semibold text-[#1E293B]">{role.title}</div>
              <p className="mb-3 text-xs text-[#64748B]">{role.tagline}</p>
              <ul className="flex flex-col gap-1.5 text-sm text-[#64748B]">
                {role.items.map((item) => (
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

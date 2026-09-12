import { lifecycleColumns } from "../../data/homeContent";

export default function BeforeDuringAfter() {
  return (
    <section className="bg-[#EFF6FF] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-[#1E293B]">
          Supporting your event from start to finish.
        </h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {lifecycleColumns.map((column) => (
            <div key={column.label} className="rounded-xl border border-[#E2E8F0] bg-white p-6">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
                {column.label}
              </div>
              <ul className="flex flex-col gap-2 text-sm text-[#64748B]">
                {column.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#2563EB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

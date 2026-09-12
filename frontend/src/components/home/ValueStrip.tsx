import { valueProps } from "../../data/homeContent";
import { TicketIcon, PulseIcon, UsersIcon, ChartIcon } from "./icons";

const icons = [TicketIcon, PulseIcon, UsersIcon, ChartIcon];

export default function ValueStrip() {
  return (
    <section className="border-y border-[#DBEAFE] bg-[#EFF6FF]">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((item, i) => {
          const Icon = icons[i];
          return (
            <div
              key={item.title}
              className="group rounded-xl p-4 transition-colors hover:bg-white"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB] transition-transform group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mb-1 text-sm font-semibold text-[#1E293B]">{item.title}</div>
              <p className="text-sm leading-relaxed text-[#64748B]">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

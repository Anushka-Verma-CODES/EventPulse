
import { valueProps } from "../../data/homeContent";
import { TicketIcon, PulseIcon, UsersIcon, ChartIcon } from "./icons";

const icons = [TicketIcon, PulseIcon, UsersIcon, ChartIcon];

export default function ValueStrip() {
  return (
    <section className="border-y border-[#E2E8F0] bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((item, index) => {
          const Icon = icons[index];

          return (
            <div
              key={item.title}
              className={`flex items-start gap-4 py-6 lg:px-6 ${
                index !== 0 ? "lg:border-l lg:border-[#E2E8F0]" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#1E293B]">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-[#64748B]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

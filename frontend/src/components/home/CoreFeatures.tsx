import { coreFeatures } from "../../data/homeContent";
import {
  TicketIcon,
  PulseIcon,
  UsersIcon,
  GateIcon,
  AlertIcon,
  BoxIcon,
  BellIcon,
  ReportIcon,
} from "./icons";

const icons = [TicketIcon, PulseIcon, UsersIcon, GateIcon, AlertIcon, BoxIcon, BellIcon, ReportIcon];

export default function CoreFeatures() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <span className="text-xs font-semibold tracking-wide text-[#2563EB]">FEATURES</span>
        <h2 className="mt-2 text-2xl font-bold text-[#1E293B]">Everything your event needs.</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map((feature, i) => {
            const Icon = icons[i];
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="mb-1 text-sm font-semibold text-[#1E293B]">{feature.title}</div>
                <p className="text-sm leading-relaxed text-[#64748B]">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

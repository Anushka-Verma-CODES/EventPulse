
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

const icons = [
  TicketIcon,
  PulseIcon,
  UsersIcon,
  GateIcon,
  AlertIcon,
  BoxIcon,
  BellIcon,
  ReportIcon,
];

const qrBlocks = [
  1, 1, 1, 0, 1, 0, 1, 0,
  1, 1, 1, 0, 0, 1, 0, 1,
  1, 0, 1, 1, 1, 0, 1, 0,
  0, 1, 0, 1, 1, 1, 0, 1,
  1, 1, 0, 0, 1, 0, 1, 1,
  0, 1, 1, 1, 0, 1, 0, 1,
  1, 0, 1, 0, 1, 1, 1, 0,
  1, 1, 0, 1, 0, 1, 1, 1,
];

export default function CoreFeatures() {
  const featuredFeatures = coreFeatures.slice(0, 2);
  const remainingFeatures = coreFeatures.slice(2);

  return (
    <section className="bg-[#F8FAFC]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold tracking-[0.16em] text-[#2563EB]">
            WHAT EVENTPULSE OFFERS
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1E293B] sm:text-4xl">
            Everything your event needs.
          </h2>

          <p className="mt-3 text-base leading-7 text-[#64748B]">
            From the first registration to the final check-in, manage the
            important parts of your event from one platform.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {featuredFeatures.map((feature, index) => {
            const Icon = icons[index];

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-[#DBEAFE] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/60 sm:p-8"
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-[#2563EB]">
                      0{index + 1} / CORE FEATURE
                    </span>

                    <h3 className="mt-4 text-xl font-bold text-[#1E293B]">
                      {feature.title}
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
                      {feature.description}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                {index === 0 ? (
                  <div className="mt-8 flex items-center justify-between rounded-xl bg-[#F8FAFC] p-5">
                    <div>
                      <p className="text-sm font-semibold text-[#1E293B]">
                        Digital ticketing
                      </p>
                      <p className="mt-1 text-xs text-[#64748B]">
                        One ticket. One unique QR code.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Ready for validation
                      </div>
                    </div>

                    <div className="grid h-24 w-24 shrink-0 grid-cols-8 gap-0.5 rounded-lg border border-[#E2E8F0] bg-white p-2">
                      {qrBlocks.map((block, i) => (
                        <div
                          key={i}
                          className={
                            block
                              ? "rounded-[1px] bg-[#1E293B]"
                              : "rounded-[1px] bg-transparent"
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 rounded-xl bg-[#F8FAFC] p-5">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                      Event workflow
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {["Create", "Manage", "Publish"].map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          <div className="rounded-lg border border-[#DBEAFE] bg-white px-3 py-2 text-sm font-medium text-[#1E293B]">
                            <span className="mr-2 text-xs text-[#2563EB]">
                              0{i + 1}
                            </span>
                            {step}
                          </div>

                          {i !== 2 && (
                            <span className="text-[#94A3B8]">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1E293B]">
              More tools to run your event
            </h3>

            <span className="text-xs font-medium text-[#64748B]">
              {remainingFeatures.length} additional features
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {remainingFeatures.map((feature, index) => {
              const Icon = icons[index + 2];

              return (
                <div
                  key={feature.title}
                  className="group flex gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#1E293B]">
                      {feature.title}
                    </h4>

                    <p className="mt-1.5 text-sm leading-6 text-[#64748B]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#DBEAFE] opacity-60 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <span className="inline-block animate-[fadeInUp_0.7s_ease-out] rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold tracking-wide text-[#2563EB]">
            EVENT MANAGEMENT PLATFORM
          </span>
          <h1 className="mt-4 animate-[fadeInUp_0.7s_ease-out_0.1s_both] text-4xl font-bold leading-tight text-[#1E293B] lg:text-5xl">
            Plan events better. Run them smoothly.
          </h1>
          <p className="mt-4 max-w-md animate-[fadeInUp_0.7s_ease-out_0.2s_both] text-base leading-relaxed text-[#64748B]">
            EventPulse brings event planning, registrations, QR tickets, volunteers and
            live operations together in one simple platform.
          </p>
          <div className="mt-8 flex animate-[fadeInUp_0.7s_ease-out_0.3s_both] flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8] hover:shadow-md"
            >
              Create an Event &rarr;
            </Link>
            <Link
              to="/events"
              className="rounded-lg border border-[#E2E8F0] px-5 py-2.5 text-sm font-medium text-[#1E293B] transition-colors hover:bg-[#F8FAFC]"
            >
              Explore Events
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-lg shadow-[#2563EB]/5">
          <div className="mb-1 text-sm font-semibold text-[#1E293B]">Event Overview</div>
          <div className="mb-4 text-xs text-[#64748B]">
            Tech Fest 2026 &bull; 18 October 2026 &bull; Main Auditorium
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-[#F8FAFC] p-3 text-center">
              <div className="text-lg font-semibold text-[#1E293B]">2,000</div>
              <div className="text-xs text-[#64748B]">Tickets</div>
            </div>
            <div className="rounded-lg bg-[#F8FAFC] p-3 text-center">
              <div className="text-lg font-semibold text-[#1E293B]">1,420</div>
              <div className="text-xs text-[#64748B]">Checked In</div>
            </div>
            <div className="rounded-lg bg-[#F8FAFC] p-3 text-center">
              <div className="text-lg font-semibold text-[#1E293B]">580</div>
              <div className="text-xs text-[#64748B]">Remaining</div>
            </div>
          </div>

          <div className="mb-2 text-xs font-semibold text-[#1E293B]">Gate Status</div>
          <div className="mb-4 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#1E293B]">Gate 1</span>
              <span className="flex items-center gap-1.5 text-[#16A34A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> Normal
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#1E293B]">Gate 2</span>
              <span className="flex items-center gap-1.5 text-[#D97706]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" /> Busy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#1E293B]">Gate 3</span>
              <span className="flex items-center gap-1.5 text-[#16A34A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> Normal
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Attendance</span>
            <span className="font-medium text-[#1E293B]">71%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div className="h-full w-[71%] rounded-full bg-[#2563EB]" />
          </div>
        </div>
      </div>
    </section>
  );
}

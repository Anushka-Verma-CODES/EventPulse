import { Link } from "react-router-dom";

export default function AuthIllustration() {
  return (
    <div
      className="hidden h-full flex-col justify-between bg-[#EFF6FF] p-10 lg:flex"
      style={{
        backgroundImage: "radial-gradient(#DBEAFE 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <Link to="/" className="flex items-center gap-2 text-sm font-medium text-[#1E293B] hover:opacity-80">
        <span className="h-2 w-2 rounded-full bg-[#2563EB]" aria-hidden="true" />
        EventPulse
      </Link>

      <div className="max-w-sm">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <h1 className="animate-[fadeInUp_0.7s_ease-out] text-3xl font-bold leading-tight text-[#1E293B]">
          Plan events better. Run them smoothly.
        </h1>
        <p className="mt-3 animate-[fadeInUp_0.7s_ease-out_0.15s_both] text-sm leading-relaxed text-[#64748B]">
          EventPulse brings event planning, registrations, QR tickets, volunteers and
          live operations together in one simple platform.
        </p>
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
  );
}

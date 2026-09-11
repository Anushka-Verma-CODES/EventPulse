import { Link } from "react-router-dom";

export default function AuthIllustration() {
  return (
    <div className="hidden h-full flex-col justify-between bg-[#12173D] p-10 text-white lg:flex">
      <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-80">
        <span className="h-2 w-2 rounded-full bg-[#5B8CFF]" aria-hidden="true" />
        EventPulse
      </Link>

      <div className="max-w-sm">
        <h1 className="text-3xl font-medium leading-tight">Run every event smarter</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#B7BBDD]">
          Plan your event, manage attendees and volunteers, monitor operations, and make
          better decisions from one platform.
        </p>
      </div>

      <div className="rounded-xl border border-[#2A2F5C] bg-[#1A2050] p-4">
        <div className="mb-3 flex items-center gap-1.5 text-xs text-[#8F94C4]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B6B]" aria-hidden="true" />
          Live event
        </div>
        <div className="mb-3 text-xl font-medium">
          1,248 <span className="text-xs font-normal text-[#8F94C4]">attendees</span>
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-md bg-[#0F1440] p-2">
            <div className="text-[#8F94C4]">Gate 1</div>
            <div className="font-medium text-[#4FD1A5]">Normal</div>
          </div>
          <div className="rounded-md bg-[#0F1440] p-2">
            <div className="text-[#8F94C4]">Gate 2</div>
            <div className="font-medium text-[#FF6B6B]">High</div>
          </div>
          <div className="rounded-md bg-[#0F1440] p-2">
            <div className="text-[#8F94C4]">Gate 3</div>
            <div className="font-medium text-[#4FD1A5]">Normal</div>
          </div>
        </div>
        <div className="text-xs text-[#8F94C4]">Volunteers 32/35 &middot; Incidents 2</div>
      </div>
    </div>
  );
}

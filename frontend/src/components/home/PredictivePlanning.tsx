export default function PredictivePlanning() {
  return (
    <section className="bg-[#EFF6FF] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-[#1E293B]">Plan with better insight.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          EventPulse can use event data and basic statistical methods to estimate
          attendance, peak arrival periods, gate congestion, volunteer demand and
          resource requirements.
        </p>

        <div className="mt-8 max-w-md rounded-xl border border-[#E2E8F0] bg-white p-6">
          <div className="mb-4 text-sm font-semibold text-[#1E293B]">
            Event Planning Estimate
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Expected Attendance</span>
              <span className="font-medium text-[#1E293B]">1,850 attendees</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Peak Arrival</span>
              <span className="font-medium text-[#1E293B]">10:15 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Gate Risk</span>
              <span className="font-medium text-[#D97706]">Gate 2 &mdash; High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Volunteer Demand</span>
              <span className="font-medium text-[#1E293B]">18 volunteers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

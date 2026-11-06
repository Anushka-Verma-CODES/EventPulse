
import { teamMembers } from "../../data/homeContent";

export default function TeamSection() {
  return (
    <section className="bg-[#EFF6FF] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            The people behind EventPulse
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1E293B] sm:text-4xl">
            Meet the Team
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#64748B]">
            EventPulse is developed as a Software Engineering project at
            Thapar Institute of Engineering and Technology.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div
              key={member.rollNo}
              className="group rounded-2xl border border-[#DBEAFE] bg-white p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-transform duration-300 group-hover:scale-105">
                {member.initials}
              </div>

              <h3 className="text-base font-bold text-[#1E293B]">
                {member.name}
              </h3>

              <p className="mt-1 text-sm text-[#64748B]">
                Project Member
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#F8FAFC] px-4 py-2">
                <span className="text-xs font-medium text-[#94A3B8]">
                  Roll No.
                </span>
                <span className="text-xs font-semibold tracking-wide text-[#334155]">
                  {member.rollNo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

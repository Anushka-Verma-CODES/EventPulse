import { teamMembers } from "../../data/homeContent";

export default function TeamSection() {
  return (
    <section className="bg-[#EFF6FF] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold text-[#1E293B]">Meet the Team</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          EventPulse is developed as a Software Engineering project at Thapar Institute
          of Engineering and Technology.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.rollNo}
              className="rounded-xl border border-[#DBEAFE] bg-white p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
                {member.initials}
              </div>
              <div className="text-sm font-semibold text-[#1E293B]">{member.name}</div>
              <div className="text-xs text-[#64748B]">Project Member</div>
              <div className="text-xs text-[#64748B]">{member.rollNo}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

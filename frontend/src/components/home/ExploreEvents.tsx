import { Link } from "react-router-dom";
import { mockEvents } from "../../data/homeContent";

export default function ExploreEvents() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-[#1E293B]">Find your next event.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
          Explore upcoming college, community and workshop events.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockEvents.map((event) => (
            <div
              key={event.title}
              className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="h-32 bg-[#EFF6FF]" aria-hidden="true" />
              <div className="p-4">
                <div className="mb-1 text-sm font-semibold text-[#1E293B]">{event.title}</div>
                <div className="mb-1 text-xs text-[#64748B]">{event.date}</div>
                <div className="mb-3 text-xs text-[#64748B]">{event.venue}</div>
                <Link to="/events" className="text-sm font-medium text-[#2563EB] hover:underline">
                  View Event &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link to="/events" className="text-sm font-medium text-[#2563EB] hover:underline">
            View All Events &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

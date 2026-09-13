import { useState } from "react";
import { useParams } from "react-router-dom";
import { organizerEvents } from "../../lib/organizerMockData";

const tabs = ["Overview", "Attendees", "Tickets", "Gates", "Volunteers", "Resources", "Incidents", "Reports"];

export default function EventDetail() {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const event = organizerEvents.find((e) => e.id === eventId) ?? organizerEvents[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">{event.name}</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            {event.date} &bull; {event.venue}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]">
            Edit Event
          </button>
          <button className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]">
            View Public Page
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {event.registered.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">Registrations</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">1,420</div>
          <div className="mt-1 text-xs text-[#64748B]">Checked In</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">580</div>
          <div className="mt-1 text-xs text-[#64748B]">Remaining</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="text-2xl font-semibold text-[#1E293B]">
            {event.capacity.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#64748B]">Capacity</div>
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#E2E8F0]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        {activeTab === "Overview" ? (
          <p className="text-sm text-[#64748B]">
            Event overview and key details go here — venue map, schedule, and settings.
          </p>
        ) : (
          <p className="text-sm text-[#64748B]">
            {activeTab} for this event isn&apos;t connected to real data yet. This tab is
            ready for the {activeTab.toLowerCase()} view once the backend is available.
          </p>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { notifications as initialNotifications } from "../../lib/volunteerMockData";

const filters = ["All", "Unread"];

export default function VolunteerNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("All");

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const filtered =
    activeFilter === "Unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#1E293B]">Notifications</h2>
        <button
          type="button"
          onClick={markAllAsRead}
          className="text-sm font-medium text-[#2563EB] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="mt-5 flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : "text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {filtered.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-xl border p-4 shadow-sm ${
              notification.read ? "border-[#E2E8F0] bg-white" : "border-[#DBEAFE] bg-[#EFF6FF]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[#2563EB]">&#128276;</span>
              <span className="text-sm font-semibold text-[#1E293B]">{notification.title}</span>
            </div>
            <p className="mt-1 pl-6 text-sm text-[#64748B]">{notification.message}</p>
            <div className="mt-1 pl-6 text-xs text-[#94A3B8]">{notification.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

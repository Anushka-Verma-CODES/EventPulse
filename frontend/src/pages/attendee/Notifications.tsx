import { useState } from "react";

const initialNotifications = [
  {
    id: 1,
    title: "Ticket reminder",
    message: "Your Tech Fest 2026 ticket is due for check-in in 2 hours.",
    time: "10 minutes ago",
    read: false,
    tag: "Event",
  },
  {
    id: 2,
    title: "Registration confirmed",
    message: "Your registration for Developer Workshop has been successfully confirmed.",
    time: "1 hour ago",
    read: false,
    tag: "Booking",
  },
  {
    id: 3,
    title: "New update",
    message: "The venue for Cultural Evening has changed. Please review the updated details.",
    time: "Yesterday",
    read: true,
    tag: "Update",
  },
  {
    id: 4,
    title: "Transfer approved",
    message: "Your ticket transfer request was approved and the new attendee has access.",
    time: "2 days ago",
    read: true,
    tag: "Transfer",
  },
];

const filters = ["All", "Unread"] as const;

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");

  const filteredNotifications =
    activeFilter === "Unread"
      ? notifications.filter((notification) => !notification.read)
      : notifications;

  function markAllAsRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">Notifications</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Stay updated on registrations, reminders, and ticket activity.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAsRead}
          className="text-sm font-medium text-[#2563EB] transition hover:underline"
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

      <div className="mt-5 flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-10 text-center">
            <p className="text-sm text-[#64748B]">No unread notifications right now.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 shadow-sm transition ${
                notification.read
                  ? "border-[#E2E8F0] bg-white"
                  : "border-[#DBEAFE] bg-[#EFF6FF]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#DBEAFE] text-sm">
                    🔔
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#1E293B]">
                        {notification.title}
                      </h3>
                      <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#475569]">
                        {notification.tag}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                      {notification.message}
                    </p>
                  </div>
                </div>

                <span className="whitespace-nowrap text-xs text-[#94A3B8]">
                  {notification.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

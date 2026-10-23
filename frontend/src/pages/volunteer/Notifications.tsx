
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "../../features/notifications/api/notificationsApi";

const filters = ["All", "Unread"] as const;

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const difference = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  if (difference < 60_000) return "Just now";
  if (difference < 3_600_000) {
    return `${Math.floor(difference / 60_000)} minutes ago`;
  }
  if (difference < 86_400_000) {
    return `${Math.floor(difference / 3_600_000)} hours ago`;
  }
  if (difference < 172_800_000) return "Yesterday";

  return date.toLocaleDateString();
}

export default function VolunteerNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setNotifications(await getNotifications());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications =
    activeFilter === "Unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications;

  async function handleMarkAllAsRead() {
    try {
      setError("");
      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notifications as read.",
      );
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? { ...item, isRead: true }
              : item,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update notification.",
        );
        return;
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Stay updated on your volunteer applications, assignments, and shifts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={
            loading ||
            notifications.every((notification) => notification.isRead)
          }
          className="text-sm font-medium text-[#2563EB] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
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

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={() => void loadNotifications()}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {loading ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-10 text-center">
            <p className="text-sm text-[#64748B]">
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-10 text-center">
            <p className="text-sm text-[#64748B]">
              {activeFilter === "Unread"
                ? "No unread notifications right now."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 shadow-sm ${
                notification.isRead
                  ? "border-[#E2E8F0] bg-white"
                  : "border-[#DBEAFE] bg-[#EFF6FF]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => void handleNotificationClick(notification)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                >
                  <span className="mt-0.5 text-[#2563EB]">
                    &#128276;
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#1E293B]">
                        {notification.title}
                      </span>

                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-[#64748B]">
                      {notification.message}
                    </p>

                    <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-wide text-[#64748B]">
                      {notification.type}
                    </span>
                  </div>
                </button>

                <span className="whitespace-nowrap text-xs text-[#94A3B8]">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

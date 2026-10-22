
import { getAuthHeaders } from "../../../lib/authApi";

const API_BASE_URL = "http://localhost:3000";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = Array.isArray(error?.message)
      ? error.message.join(", ")
      : error?.message;

    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getNotifications(): Promise<Notification[]> {
  return request<Notification[]>("/notifications");
}

export function markNotificationAsRead(
  notificationId: string,
): Promise<Notification> {
  return request<Notification>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" },
  );
}

export function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  return request<{ updated: number }>("/notifications/read-all", {
    method: "PATCH",
  });
}

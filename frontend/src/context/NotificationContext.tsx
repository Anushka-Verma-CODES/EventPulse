
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "../features/notifications/api/notificationsApi";
import { connectNotificationSocket } from "../lib/socket";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, isAuthenticated, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);

    try {
      const result = await getNotifications();
      setNotifications(result);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;

    const supportedRoles = ["attendee", "organizer", "volunteer"];
    const hasSupportedRole = profile?.roles.some((role) =>
      supportedRoles.includes(role),
    );

    if (!isAuthenticated || !profile || !hasSupportedRole) {
      setNotifications([]);
      return;
    }

    void refreshNotifications().catch(() => {});

    const socket = connectNotificationSocket();

    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications((current) => {
        if (current.some((item) => item.id === notification.id)) {
          return current;
        }

        return [notification, ...current];
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.disconnect();
    };
  }, [
    profile,
    isAuthenticated,
    authLoading,
    refreshNotifications,
  ]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const updated = await markNotificationAsRead(notificationId);

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? updated : notification,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }

  return context;
}

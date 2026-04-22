import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
import { api, NOTIFICATIONS_API, WS_URL, NOTIFICATION_TOPIC, Notification, KEYS, AUTH_API } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await api.get(NOTIFICATIONS_API.LIST);
      // Handle both { data: [...] } and directly returning [...]
      const notificationData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setNotifications(notificationData);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      // Try PATCH first, fallback to PUT then POST
      try {
        await api.patch(NOTIFICATIONS_API.MARK_READ(id));
      } catch {
        try {
          await api.put(NOTIFICATIONS_API.MARK_READ(id));
        } catch {
          await api.post(NOTIFICATIONS_API.MARK_READ(id));
        }
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Since the backend lacks a standalone /read-all endpoint, extract all 
      // unread IDs and fire individual {id}/read PATCH requests concurrently!
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);

      if (unreadIds.length > 0) {
        await Promise.all(
          unreadIds.map(id => api.patch(NOTIFICATIONS_API.MARK_READ(id)).catch(() => { }))
        );
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [notifications]);

  // Get WebSocket token - shared logic with ChatContext
  const getWsToken = useCallback(async (): Promise<string | null> => {
    let accessToken = localStorage.getItem(KEYS.ACCESS);

    if (!accessToken) {
      try {
        console.log("🛠️ Notification token missing. Fetching fresh token...");
        const res = await api.get(AUTH_API.WS_TOKEN);
        accessToken = res.data?.data?.accessToken || res.data?.accessToken || null;
        if (accessToken) {
          localStorage.setItem(KEYS.ACCESS, accessToken);
        }
      } catch (err) {
        console.error("Failed to fetch fresh ws-token for notifications:", err);
      }
    }
    return accessToken;
  }, []);

  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;
    let activeClient: Client | null = null;

    const connectNotifications = async () => {
      try {
        const token = await getWsToken();
        if (!token || !isMounted) return;

        console.log("🛠️ Setting up Notification WebSocket...");
        activeClient = new Client({
          webSocketFactory: () => new SockJS(WS_URL),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          beforeConnect: async () => {
            try {
              const freshToken = await getWsToken();
              if (freshToken && activeClient) {
                activeClient.connectHeaders = { Authorization: `Bearer ${freshToken}` };
              }
            } catch (err) {
              console.warn("Failed to refresh token in Notification beforeConnect", err);
            }
          },
          onConnect: () => {
            console.log("🟢 Notification WebSocket connected");
            if (!activeClient) return;

            activeClient.subscribe(
              NOTIFICATION_TOPIC(user.email!),
              (message: IMessage) => {
                try {
                  const notification: Notification = JSON.parse(message.body);
                  console.log("New notification received:", notification);

                  // Show toast notification
                  toast.info(notification.message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                  });

                  setNotifications((prev) => [notification, ...prev]);
                } catch (err) {
                  console.error("Failed to parse notification:", err);
                }
              }
            );
          },
          onStompError: (frame) => {
            console.warn("🔴 STOMP error for notifications:", frame.headers["message"]);
          },
          onWebSocketError: (event) => {
            console.warn("🔴 WebSocket error for notifications:", event);
          },
        });

        activeClient.activate();
        setStompClient(activeClient);
      } catch (err) {
        console.error("❌ Failed to initialize Notification WebSocket:", err);
      }
    };

    connectNotifications();

    return () => {
      isMounted = false;
      if (activeClient) {
        activeClient.deactivate();
      }
    };
  }, [user?.email, getWsToken]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
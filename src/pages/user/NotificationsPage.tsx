import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { api, NOTIFICATIONS_API } from "@/lib/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(NOTIFICATIONS_API.LIST)
      .then(({ data }) => setNotifications(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markRead = async (id: number) => {
    try {
      await api.patch(NOTIFICATIONS_API.MARK_READ(id));
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Bell size={24} /> Notifications
            </h1>
            {unread > 0 && (
              <p className="text-sm text-muted-foreground mt-1">{unread} unread</p>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-card rounded-xl border p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !n.read ? "border-primary/30 bg-primary/5" : "border-border"
                  }`}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    N
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</h3>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                      <Check size={14} />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

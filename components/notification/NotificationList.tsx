"use client";

import { useEffect, useState } from "react";
import { notificationApi } from "@/lib/notification.api";
import { BellOff, Circle } from "lucide-react";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await notificationApi.getAll(20);
      const data = res?.data ?? [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    // Optimistic UI update to make it feel instant
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    await notificationApi.markAsRead(id);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full bg-genz-bg animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[450px] overflow-y-auto scrollbar-hide">
      {notifications.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-genz-bg rounded-full text-genz-muted mb-3">
            <BellOff size={24} />
          </div>
          <p className="text-sm font-bold text-genz-ink">All caught up!</p>
          <p className="text-xs text-genz-muted mt-1">No new notifications yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-genz-border">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`group relative p-4 transition-all duration-200 cursor-pointer flex gap-3
                ${!n.isRead ? "bg-genz-softAccent/30" : "hover:bg-genz-bg"}
              `}
            >
              {/* Unread Indicator Dot */}
              {!n.isRead && (
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
                  <Circle size={8} className="fill-genz-accent text-genz-accent" />
                </div>
              )}

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`text-sm leading-none tracking-tight ${!n.isRead ? "font-black text-genz-ink" : "font-bold text-genz-muted"}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] font-medium text-genz-muted whitespace-nowrap">
                    {formatTime(n.createdAt)}
                  </span>
                </div>
                
                <p className={`text-xs leading-relaxed ${!n.isRead ? "text-genz-ink/80 font-medium" : "text-genz-muted"}`}>
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Action */}
      
    </div>
  );
}

/* Simple helper for GenZ style time */
function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString();
}
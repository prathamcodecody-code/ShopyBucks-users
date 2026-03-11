import { api } from "@/lib/api";

export const notificationApi = {
  getAll: (limit = 20) =>
    api.get(`/notifications?limit=${limit}`),

  getUnreadCount: () =>
    api.get(`/notifications/unread-count`),

  markAsRead: (id: number) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch(`/notifications/read-all`),

  deleteNotification: (id: number) =>
    api.delete(`/notifications/${id}`),
};
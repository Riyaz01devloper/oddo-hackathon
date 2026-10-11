import api from "./api";

export const getNotifications = () => api.get("/notifications");

export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = (notificationIds) =>
    api.patch("/notifications/read-all", { notificationIds });


// src/hooks/useRealtimeNotifications.ts
//
// Hook gắn vào component dashboard (AssistantDashboard, MangakaDashboard, ...)
// để vừa load danh sách ban đầu qua REST (như code cũ), vừa nhận update realtime.
//
// Dùng isAuthenticated từ useAuth() (đã có sẵn trong project, xem useAuth.ts)
// thay vì accessToken — vì token nằm trong cookie httpOnly, component không
// cần và không thể biết giá trị token, chỉ cần biết "đã đăng nhập hay chưa".

import { useEffect, useState } from "react";
import {
  fetchMyNotifications,
  type NotificationItem,
} from "../services/notificationService";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
  onNotification,
} from "../services/notificationSocket";
import { useAuth } from "./useAuth";

export function useRealtimeNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMyNotifications().then(setNotifications).catch(console.error);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    connectNotificationSocket();
    const unsubscribe = onNotification((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      unsubscribe();
      disconnectNotificationSocket();
    };
  }, [isAuthenticated]);

  return notifications;
}

import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { NotificationItem } from "./notificationService";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL ?? "http://localhost:8080";

type NotificationHandler = (notification: NotificationItem) => void;

let client: Client | null = null;
const handlers = new Set<NotificationHandler>();

export function connectNotificationSocket() {
  if (client?.active) return;

  client = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      client?.subscribe("/user/queue/notifications", (message: IMessage) => {
        try {
          const notification: NotificationItem = JSON.parse(message.body);
          handlers.forEach((handler) => handler(notification));
        } catch (err) {
          console.error("Không parse được notification realtime:", err);
        }
      });
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame.headers["message"], frame.body);
    },

    onWebSocketClose: () => {
      console.warn("WebSocket notification đã đóng, sẽ tự reconnect...");
    },
  });

  client.activate();
}

export function disconnectNotificationSocket() {
  client?.deactivate();
  client = null;
  handlers.clear();
}

export function onNotification(handler: NotificationHandler): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

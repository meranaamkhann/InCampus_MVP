import { Client, type IMessage } from "@stomp/stompjs";
import { useAuthStore } from "./auth-store";

let client: Client | null = null;

/**
 * Lazily creates (or returns) a single shared STOMP client for the session.
 * Backend expects a SockJS-compatible handshake at /ws (see WebSocketConfig
 * on the backend) — using native WebSocket transport here for simplicity;
 * swap to `sockjs-client` if you need to support browsers/proxies that
 * block raw WS.
 */
export function getStompClient(): Client {
  if (client) return client;

  const wsUrl = (process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8080/ws").replace(
    /^http/,
    "ws"
  );

  client = new Client({
    brokerURL: wsUrl,
    connectHeaders: {
      Authorization: `Bearer ${useAuthStore.getState().accessToken ?? ""}`,
    },
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });

  return client;
}

export function subscribeToRoom(roomId: string, onMessage: (msg: IMessage) => void) {
  const c = getStompClient();
  return c.subscribe(`/topic/chat/${roomId}`, onMessage);
}

export function subscribeToTyping(roomId: string, onEvent: (msg: IMessage) => void) {
  const c = getStompClient();
  return c.subscribe(`/topic/chat/${roomId}/typing`, onEvent);
}

export function subscribeToNotifications(onNotification: (msg: IMessage) => void) {
  const c = getStompClient();
  return c.subscribe(`/user/queue/notifications`, onNotification);
}

export function sendChatMessage(roomId: string, content: string) {
  getStompClient().publish({
    destination: "/app/chat.send",
    body: JSON.stringify({ roomId, content }),
  });
}

export function sendTyping(roomId: string, typing: boolean) {
  getStompClient().publish({
    destination: "/app/chat.typing",
    body: JSON.stringify({ roomId, typing }),
  });
}

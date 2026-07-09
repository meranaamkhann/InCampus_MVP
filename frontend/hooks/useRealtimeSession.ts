"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { useNotificationStore } from "@/lib/notification-store";
import { getStompClient, subscribeToNotifications } from "@/lib/websocket";
import type { ApiResponse } from "@/types";

/**
 * Single place that owns the STOMP connection lifecycle for the whole
 * dashboard: connects once, subscribes to the user's notification queue so
 * the bell updates instantly instead of only polling, and sends a presence
 * heartbeat every 40s (comfortably under the backend's 60s Redis TTL in
 * PresenceService) so "online" reflects "app is open," not just "currently
 * typing in a chat."
 */
export function useRealtimeSession() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const increment = useNotificationStore((s) => s.increment);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  // Seed the count once on load so the badge is correct before any realtime event arrives.
  useEffect(() => {
    if (!accessToken) return;
    api.get<ApiResponse<number>>("/notifications/unread-count").then((res) => setUnreadCount(res.data.data));
  }, [accessToken, setUnreadCount]);

  useEffect(() => {
    if (!accessToken) return;

    const client = getStompClient();
    let notifSub: ReturnType<typeof subscribeToNotifications> | undefined;
    let heartbeat: ReturnType<typeof setInterval> | undefined;

    function onConnect() {
      notifSub = subscribeToNotifications(() => increment());
      heartbeat = setInterval(() => {
        client.publish({ destination: "/app/presence.heartbeat", body: "{}" });
      }, 40000);
    }

    if (client.connected) {
      onConnect();
    } else {
      client.onConnect = onConnect;
      client.activate();
    }

    return () => {
      notifSub?.unsubscribe();
      if (heartbeat) clearInterval(heartbeat);
    };
  }, [accessToken, increment]);
}

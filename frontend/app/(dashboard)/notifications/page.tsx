"use client";

import { Heart, MessageCircle, CalendarDays, UserPlus, Bell, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import { usePaginated } from "@/hooks/usePaginated";
import { api } from "@/lib/api";
import { useNotificationStore } from "@/lib/notification-store";
import type { NotificationDto } from "@/types";

const icons: Record<string, typeof Heart> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  EVENT_INVITE: CalendarDays,
  MESSAGE: MessageCircle,
  FRIEND_REQUEST: UserPlus,
  FRIEND_REQUEST_ACCEPTED: UserPlus,
  NEW_FOLLOWER: UserPlus,
  COMMUNITY_INVITE: Bell,
  PROJECT_JOIN_REQUEST: Bell,
  REPORT_ACTIONED: Bell,
};

export default function NotificationsPage() {
  const { items, setItems, loading, hasMore, sentinelRef } = usePaginated<NotificationDto>("/notifications");
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(Math.max(0, unreadCount - 1));
    await api.post(`/notifications/${id}/read`);
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await api.post("/notifications/read-all");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Notifications</h1>
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          <CheckCheck size={15} className="mr-1" /> Mark all read
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {items.map((n) => {
          const Icon = icons[n.type] ?? Bell;
          return (
            <Card
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={cn("flex cursor-pointer items-center gap-3 p-4", !n.read && "border-primary/40")}
            >
              {n.actor ? (
                <Avatar name={n.actor.name} src={n.actor.profilePictureUrl} size={36} />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon size={16} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-ink-faint">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </Card>
          );
        })}
      </div>

      {loading && <p className="mt-6 text-center text-sm text-ink-muted">Loading…</p>}
      {!loading && items.length === 0 && (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-ink-muted">You&apos;re all caught up.</div>
      )}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

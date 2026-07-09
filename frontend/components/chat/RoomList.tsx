"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ChatRoomDto } from "@/types";

export function RoomList({
  rooms,
  activeRoomId,
  onSelect,
}: {
  rooms: ChatRoomDto[];
  activeRoomId: string | null;
  onSelect: (roomId: string) => void;
}) {
  if (rooms.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-ink-muted">
        No conversations yet. Message someone from their profile to start one.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelect(room.id)}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5",
            activeRoomId === room.id && "bg-primary/10"
          )}
        >
          <Avatar name={room.otherUser.name} src={room.otherUser.profilePictureUrl} online={room.otherUserOnline} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{room.otherUser.name}</p>
            <p className="truncate text-xs text-ink-faint">{room.lastMessagePreview ?? "No messages yet"}</p>
          </div>
          {room.lastMessageAt && (
            <span className="shrink-0 text-[11px] text-ink-faint">{formatRelativeTime(room.lastMessageAt)}</span>
          )}
        </button>
      ))}
    </div>
  );
}

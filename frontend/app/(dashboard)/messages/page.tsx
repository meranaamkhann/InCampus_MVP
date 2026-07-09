"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessagesSquare, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { RoomList } from "@/components/chat/RoomList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse, ChatRoomDto, PageResponse } from "@/types";

function MessagesContent() {
  const searchParams = useSearchParams();
  const requestedRoomId = searchParams.get("room");

  const [rooms, setRooms] = useState<ChatRoomDto[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // On mobile, list and chat share one pane - this tracks which one shows.
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  function load() {
    setLoading(true);
    setError(false);
    api
      .get<ApiResponse<PageResponse<ChatRoomDto>>>("/chat/rooms")
      .then((res) => {
        const content = res.data.data.content;
        setRooms(content);
        // Prefer the room requested via ?room= (e.g. from a profile's "Message" button);
        // fall back to the most recent conversation.
        const preferred = requestedRoomId && content.some((r) => r.id === requestedRoomId)
          ? requestedRoomId
          : content[0]?.id ?? null;
        setActiveRoomId(preferred);
        if (preferred) setMobileView("chat");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(load, [requestedRoomId]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  function selectRoom(roomId: string) {
    setActiveRoomId(roomId);
    setMobileView("chat");
  }

  if (loading) {
    return <div className="glass mx-auto h-[calc(100vh-10rem)] max-w-5xl animate-pulse rounded-2xl" />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <ErrorState onRetry={load} title="Couldn't load your conversations" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        <EmptyState
          icon={MessagesSquare}
          title="No conversations yet"
          description="Message someone from their profile to start a chat."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-10rem)] max-w-5xl gap-4 md:grid-cols-[280px_1fr]">
      <Card className={cn("overflow-y-auto p-0", mobileView === "chat" && "hidden md:block")}>
        <RoomList rooms={rooms} activeRoomId={activeRoomId} onSelect={selectRoom} />
      </Card>
      <Card className={cn("p-0", mobileView === "list" && "hidden md:block")}>
        {activeRoom ? (
          <div className="flex h-full flex-col">
            <button
              onClick={() => setMobileView("list")}
              className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5 text-xs font-medium text-ink-muted md:hidden"
            >
              <ArrowLeft size={14} /> All conversations
            </button>
            <div className="min-h-0 flex-1">
              <ChatWindow room={activeRoom} />
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-muted">
            <MessagesSquare size={28} />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesContent />
    </Suspense>
  );
}

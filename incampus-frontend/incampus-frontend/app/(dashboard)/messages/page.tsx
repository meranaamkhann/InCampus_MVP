"use client";

import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RoomList } from "@/components/chat/RoomList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { api } from "@/lib/api";
import type { ApiResponse, ChatRoomDto, PageResponse } from "@/types";

export default function MessagesPage() {
  const [rooms, setRooms] = useState<ChatRoomDto[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    api.get<ApiResponse<PageResponse<ChatRoomDto>>>("/chat/rooms").then((res) => {
      const content = res.data.data.content;
      setRooms(content);
      if (content.length > 0) setActiveRoomId(content[0].id);
    });
  }, []);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  return (
    <div className="mx-auto grid h-[calc(100vh-8rem)] max-w-5xl grid-cols-[280px_1fr] gap-4">
      <Card className="overflow-y-auto p-0">
        <RoomList rooms={rooms} activeRoomId={activeRoomId} onSelect={setActiveRoomId} />
      </Card>
      <Card className="p-0">
        {activeRoom ? (
          <ChatWindow room={activeRoom} />
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

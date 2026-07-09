"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import {
  getStompClient,
  subscribeToRoom,
  subscribeToTyping,
  sendChatMessage,
  sendTyping,
} from "@/lib/websocket";
import type { ApiResponse, ChatRoomDto, MessageDto, PageResponse } from "@/types";

export function ChatWindow({ room }: { room: ChatRoomDto }) {
  const currentUserId = useAuthStore((s) => s.userId);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history + mark read whenever the active room changes.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await api.get<ApiResponse<PageResponse<MessageDto>>>(`/chat/rooms/${room.id}/messages`);
      if (!cancelled) setMessages(res.data.data.content.reverse());
      api.post(`/chat/rooms/${room.id}/read`).catch(() => {});
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [room.id]);

  // Realtime subscription for this room.
  useEffect(() => {
    const client = getStompClient();
    if (!client.active) client.activate();

    let msgSub: ReturnType<typeof subscribeToRoom> | undefined;
    let typingSub: ReturnType<typeof subscribeToTyping> | undefined;

    function setupSubscriptions() {
      msgSub = subscribeToRoom(room.id, (frame) => {
        const incoming: MessageDto = JSON.parse(frame.body);
        setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
      });
      typingSub = subscribeToTyping(room.id, (frame) => {
        const event = JSON.parse(frame.body);
        if (event.userId !== currentUserId) {
          setOtherTyping(event.typing);
        }
      });
    }

    if (client.connected) {
      setupSubscriptions();
    } else {
      client.onConnect = setupSubscriptions;
    }

    return () => {
      msgSub?.unsubscribe();
      typingSub?.unsubscribe();
    };
  }, [room.id, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleDraftChange(value: string) {
    setDraft(value);
    sendTyping(room.id, true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTyping(room.id, false), 1500);
  }

  function handleSend() {
    if (!draft.trim()) return;
    sendChatMessage(room.id, draft.trim());
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-3">
        <Avatar name={room.otherUser.name} src={room.otherUser.profilePictureUrl} online={room.otherUserOnline} />
        <div>
          <p className="text-sm font-medium">{room.otherUser.name}</p>
          <p className="text-xs text-ink-faint">
            {otherTyping ? "typing…" : room.otherUserOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-xs rounded-2xl px-4 py-2 text-sm",
                  mine ? "bg-primary text-primary-foreground" : "glass"
                )}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 p-4">
        <Input
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button size="icon" onClick={handleSend} disabled={!draft.trim()}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}

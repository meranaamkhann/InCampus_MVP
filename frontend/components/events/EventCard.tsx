"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import type { EventDto } from "@/types";

export function EventCard({ event }: { event: EventDto }) {
  const [status, setStatus] = useState(event.currentUserStatus ?? null);
  const [joinedCount, setJoinedCount] = useState(event.joinedCount);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    try {
      await api.post(`/events/${event.id}/join`);
      if (status !== "JOINED") setJoinedCount((c) => c + 1);
      setStatus("JOINED");
      toast.success("You're in!", `See you at "${event.title}".`);
    } catch (err) {
      toast.error("Couldn't join event", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleInterested() {
    setLoading(true);
    try {
      await api.post(`/events/${event.id}/interested`);
      setStatus("INTERESTED");
    } catch (err) {
      toast.error("Couldn't update", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30">
        <CalendarDays size={28} className="text-ink/70" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold">{event.title}</h3>
          <Badge variant="accent">{event.category}</Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{event.description}</p>

        <div className="mt-3 space-y-1.5 text-xs text-ink-faint">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={13} />
            {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            {event.eventTime && ` · ${event.eventTime}`}
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={13} /> {event.location}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users size={13} /> {joinedCount} joined
            {event.maxParticipants ? ` · ${event.maxParticipants} max` : ""}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            variant={status === "JOINED" ? "outline" : "primary"}
            onClick={handleJoin}
            disabled={loading}
          >
            {status === "JOINED" ? "Joined" : "Join"}
          </Button>
          <Button
            size="sm"
            variant={status === "INTERESTED" ? "outline" : "glass"}
            onClick={handleInterested}
            disabled={loading}
          >
            Interested
          </Button>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import type { CommunityDto } from "@/types";

export function CommunityCard({ community }: { community: CommunityDto }) {
  const [joined, setJoined] = useState(community.joinedByCurrentUser);
  const [memberCount, setMemberCount] = useState(community.memberCount);
  const [loading, setLoading] = useState(false);

  async function toggleJoin() {
    setLoading(true);
    const next = !joined;
    try {
      if (next) await api.post(`/communities/${community.id}/join`);
      else await api.delete(`/communities/${community.id}/leave`);
      setJoined(next);
      setMemberCount((c) => c + (next ? 1 : -1));
    } catch {
      toast.error(next ? "Couldn't join community" : "Couldn't leave community");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
        <Users size={20} className="text-white" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold">{community.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-muted">{community.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-xs text-ink-faint">{memberCount} members</span>
        <Button size="sm" variant={joined ? "outline" : "primary"} onClick={toggleJoin} disabled={loading}>
          {joined ? "Joined" : "Join"}
        </Button>
      </div>
    </Card>
  );
}

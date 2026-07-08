"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ApiResponse, FriendRequestDto, PageResponse, UserSummary } from "@/types";

export default function FriendsPage() {
  const [pending, setPending] = useState<FriendRequestDto[]>([]);
  const [suggested, setSuggested] = useState<UserSummary[]>([]);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get<ApiResponse<PageResponse<FriendRequestDto>>>("/friends/requests/pending")
      .then((res) => setPending(res.data.data.content));
    api
      .get<ApiResponse<PageResponse<UserSummary>>>("/friends/suggested")
      .then((res) => setSuggested(res.data.data.content));
  }, []);

  async function accept(requestId: string) {
    setPending((prev) => prev.filter((r) => r.id !== requestId));
    await api.post(`/friends/requests/${requestId}/accept`);
  }

  async function reject(requestId: string) {
    setPending((prev) => prev.filter((r) => r.id !== requestId));
    await api.post(`/friends/requests/${requestId}/reject`);
  }

  async function sendRequest(userId: string) {
    setSentTo((prev) => new Set(prev).add(userId));
    await api.post(`/friends/requests/${userId}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Friends</h1>

      <h2 className="mt-8 text-sm font-semibold text-ink-muted">Pending requests</h2>
      <div className="mt-3 space-y-3">
        {pending.map((r) => (
          <Card key={r.id} className="flex items-center justify-between p-4">
            <Link href={`/profile/${r.sender.id}`} className="flex items-center gap-3">
              <Avatar name={r.sender.name} src={r.sender.profilePictureUrl} />
              <div>
                <p className="text-sm font-medium">{r.sender.name}</p>
                <p className="text-xs text-ink-faint">{r.sender.college}</p>
              </div>
            </Link>
            <div className="flex gap-2">
              <Button size="icon" variant="primary" onClick={() => accept(r.id)}>
                <Check size={15} />
              </Button>
              <Button size="icon" variant="outline" onClick={() => reject(r.id)}>
                <X size={15} />
              </Button>
            </div>
          </Card>
        ))}
        {pending.length === 0 && <p className="text-sm text-ink-muted">No pending requests.</p>}
      </div>

      <h2 className="mt-8 text-sm font-semibold text-ink-muted">Suggested for you</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {suggested.map((u) => (
          <Card key={u.id} className="flex items-center justify-between p-4">
            <Link href={`/profile/${u.id}`} className="flex items-center gap-3">
              <Avatar name={u.name} src={u.profilePictureUrl} />
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-ink-faint">{u.college}</p>
              </div>
            </Link>
            <Button size="icon" variant="glass" onClick={() => sendRequest(u.id)} disabled={sentTo.has(u.id)}>
              <UserPlus size={15} />
            </Button>
          </Card>
        ))}
        {suggested.length === 0 && <p className="text-sm text-ink-muted">No suggestions right now.</p>}
      </div>
    </div>
  );
}

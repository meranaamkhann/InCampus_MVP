"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, UserPlus, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import type { ApiResponse, FriendRequestDto, PageResponse, UserSummary } from "@/types";

export default function FriendsPage() {
  const [pending, setPending] = useState<FriendRequestDto[]>([]);
  const [suggested, setSuggested] = useState<UserSummary[]>([]);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<PageResponse<FriendRequestDto>>>("/friends/requests/pending"),
      api.get<ApiResponse<PageResponse<UserSummary>>>("/friends/suggested"),
    ])
      .then(([pendingRes, suggestedRes]) => {
        setPending(pendingRes.data.data.content);
        setSuggested(suggestedRes.data.data.content);
      })
      .catch(() => toast.error("Couldn't load friends", "Refresh to try again."))
      .finally(() => setLoading(false));
  }, []);

  async function accept(request: FriendRequestDto) {
    setPending((prev) => prev.filter((r) => r.id !== request.id));
    try {
      await api.post(`/friends/requests/${request.id}/accept`);
      toast.success("Friend added", `You and ${request.sender.name} are now connected.`);
    } catch (err) {
      setPending((prev) => [request, ...prev]);
      toast.error("Couldn't accept request", apiErrorMessage(err));
    }
  }

  async function reject(request: FriendRequestDto) {
    setPending((prev) => prev.filter((r) => r.id !== request.id));
    try {
      await api.post(`/friends/requests/${request.id}/reject`);
    } catch (err) {
      setPending((prev) => [request, ...prev]);
      toast.error("Couldn't decline request", apiErrorMessage(err));
    }
  }

  async function sendRequest(user: UserSummary) {
    setSentTo((prev) => new Set(prev).add(user.id));
    try {
      await api.post(`/friends/requests/${user.id}`);
      toast.success("Request sent", `${user.name} will see your request.`);
    } catch (err) {
      setSentTo((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
      toast.error("Couldn't send request", apiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Friends</h1>

      <h2 className="mt-8 text-sm font-semibold text-ink-muted">Pending requests</h2>
      {loading ? (
        <ListSkeleton count={2} className="mt-3" />
      ) : (
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
                <Button size="icon" variant="primary" onClick={() => accept(r)}>
                  <Check size={15} />
                </Button>
                <Button size="icon" variant="outline" onClick={() => reject(r)}>
                  <X size={15} />
                </Button>
              </div>
            </Card>
          ))}
          {pending.length === 0 && (
            <EmptyState icon={Users} title="No pending requests" description="You're all caught up here." />
          )}
        </div>
      )}

      <h2 className="mt-8 text-sm font-semibold text-ink-muted">Suggested for you</h2>
      {loading ? (
        <ListSkeleton count={2} className="mt-3" />
      ) : (
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
              <Button size="icon" variant="glass" onClick={() => sendRequest(u)} disabled={sentTo.has(u.id)}>
                <UserPlus size={15} />
              </Button>
            </Card>
          ))}
          {suggested.length === 0 && (
            <EmptyState
              icon={UserPlus}
              title="No suggestions right now"
              description="Check back later as more students join."
              className="sm:col-span-2"
            />
          )}
        </div>
      )}
    </div>
  );
}

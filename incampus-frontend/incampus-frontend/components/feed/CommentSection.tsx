"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { usePaginated } from "@/hooks/usePaginated";
import type { Comment } from "@/types";

export function CommentSection({ postId }: { postId: string }) {
  const name = useAuthStore((s) => s.name) ?? "?";
  const { items: comments, setItems } = usePaginated<Comment>(`/posts/${postId}/comments`, 30);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const res = await api.post<{ data: Comment }>(`/posts/${postId}/comments`, { content: draft });
      setItems((prev) => [...prev, res.data.data]);
      setDraft("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Avatar name={name} size={32} />
        <Input placeholder="Write a comment…" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <Button size="sm" type="submit" disabled={posting || !draft.trim()}>
          Post
        </Button>
      </form>

      <div className="mt-5 space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar name={c.author.name} src={c.author.profilePictureUrl} size={32} />
            <div>
              <div className="glass rounded-2xl px-4 py-2">
                <p className="text-xs font-medium">{c.author.name}</p>
                <p className="text-sm">{c.content}</p>
              </div>
              <p className="mt-1 text-xs text-ink-faint">{formatRelativeTime(c.createdAt)}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-ink-muted">No comments yet — say something first.</p>}
      </div>
    </div>
  );
}

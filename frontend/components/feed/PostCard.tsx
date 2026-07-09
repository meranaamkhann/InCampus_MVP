"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import type { Post } from "@/types";

const typeLabels: Record<string, string> = {
  TEXT: "",
  IMAGE: "",
  EVENT: "Event",
  QUESTION: "Question",
  POLL: "Poll",
  STUDY_REQUEST: "Study Request",
  PROJECT_REQUEST: "Project Request",
  COFFEE_INVITE: "Coffee Invite",
  MOVIE_PLAN: "Movie Plan",
  SPORTS_INVITE: "Sports Invite",
};

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saved, setSaved] = useState(post.savedByCurrentUser);

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      if (next) await api.post(`/posts/${post.id}/like`);
      else await api.delete(`/posts/${post.id}/like`);
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
      toast.error("Couldn't update like");
    }
  }

  async function toggleSave() {
    const next = !saved;
    setSaved(next);
    try {
      if (next) await api.post(`/posts/${post.id}/save`);
      else await api.delete(`/posts/${post.id}/save`);
    } catch {
      setSaved(!next);
      toast.error("Couldn't update save");
    }
  }

  const label = typeLabels[post.type];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3">
          <Avatar name={post.author.name} src={post.author.profilePictureUrl} size={40} />
          <div>
            <p className="text-sm font-medium">{post.author.name}</p>
            <p className="text-xs text-ink-faint">
              {post.author.college} · {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </Link>
        {label && <Badge variant="accent">{label}</Badge>}
      </div>

      {post.content && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>}

      {post.imageUrls.length > 0 && (
        <div className={cn("mt-4 grid gap-2 overflow-hidden rounded-xl", post.imageUrls.length > 1 && "grid-cols-2")}>
          {post.imageUrls.map((url) => (
            <div key={url} className="relative aspect-video">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {post.pollOptions.length > 0 && (
        <div className="mt-4 space-y-2">
          {post.pollOptions.map((option) => (
            <button
              key={option}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-left text-sm hover:border-primary hover:bg-primary/5"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-1 border-t border-border/60 pt-3 text-ink-muted">
        <button
          onClick={toggleLike}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:bg-white/5",
            liked && "text-danger"
          )}
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
          {likeCount}
        </button>
        <Link
          href={`/posts/${post.id}`}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:bg-white/5"
        >
          <MessageCircle size={17} />
          {post.commentCount}
        </Link>
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:bg-white/5">
          <Share2 size={17} />
        </button>
        <button
          onClick={toggleSave}
          className={cn("ml-auto rounded-lg px-3 py-1.5 hover:bg-white/5", saved && "text-primary")}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </Card>
  );
}

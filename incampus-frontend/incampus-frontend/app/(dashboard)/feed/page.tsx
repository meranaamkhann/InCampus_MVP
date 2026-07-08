"use client";

import { PostCard } from "@/components/feed/PostCard";
import { CreatePostComposer } from "@/components/feed/CreatePostComposer";
import { usePaginated } from "@/hooks/usePaginated";
import type { Post } from "@/types";

export default function FeedPage() {
  const { items, setItems, loading, hasMore, sentinelRef } = usePaginated<Post>("/posts/feed");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <CreatePostComposer onCreated={(post) => setItems((prev) => [post, ...prev])} />

      {items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {loading && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="glass h-40 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center text-ink-muted">
          Nothing here yet — be the first to post something for your campus.
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

"use client";

import { Sparkles } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePostComposer } from "@/components/feed/CreatePostComposer";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { usePaginated } from "@/hooks/usePaginated";
import type { Post } from "@/types";

export default function FeedPage() {
  const { items, setItems, loading, error, hasMore, sentinelRef, retry } = usePaginated<Post>("/posts/feed");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <CreatePostComposer onCreated={(post) => setItems((prev) => [post, ...prev])} />

      {items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {loading && <ListSkeleton count={2} />}

      {error && items.length === 0 && !loading && <ErrorState onRetry={retry} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="Nothing here yet"
          description="Be the first to post something for your campus — a question, a study request, or just what's on your mind."
        />
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

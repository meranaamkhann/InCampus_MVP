"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PostCard } from "@/components/feed/PostCard";
import { CommentSection } from "@/components/feed/CommentSection";
import { api } from "@/lib/api";
import type { ApiResponse, Post } from "@/types";

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    api.get<ApiResponse<Post>>(`/posts/${params.postId}`).then((res) => setPost(res.data.data));
  }, [params.postId]);

  if (!post) {
    return <div className="glass mx-auto h-40 max-w-2xl animate-pulse rounded-2xl" />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PostCard post={post} />
      <div className="glass mt-4 rounded-2xl p-5">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle, UserPlus, UserCheck, ShieldCheck, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PostCard } from "@/components/feed/PostCard";
import { usePaginated } from "@/hooks/usePaginated";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import { useAuthStore } from "@/lib/auth-store";
import type { ApiResponse, Post, UserProfile } from "@/types";

export default function ProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.userId);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const isOwnProfile = params.userId === currentUserId;

  const { items: posts, loading: postsLoading } = usePaginated<Post>(`/posts/user/${params.userId}`, 10, [params.userId]);

  function loadProfile() {
    setLoadError(false);
    setProfile(null);
    api
      .get<ApiResponse<UserProfile>>(`/users/${params.userId}`)
      .then((res) => {
        setProfile(res.data.data);
        setFollowing(res.data.data.followedByCurrentUser);
      })
      .catch(() => setLoadError(true));
  }

  useEffect(loadProfile, [params.userId]);

  async function toggleFollow() {
    const next = !following;
    setFollowing(next);
    setFollowLoading(true);
    try {
      if (next) await api.post(`/users/${params.userId}/follow`);
      else await api.delete(`/users/${params.userId}/follow`);
    } catch (err) {
      setFollowing(!next);
      toast.error("Couldn't update follow status", apiErrorMessage(err));
    } finally {
      setFollowLoading(false);
    }
  }

  async function messageUser() {
    try {
      const res = await api.get<ApiResponse<string>>(`/chat/rooms/with/${params.userId}`);
      router.push(`/messages?room=${res.data.data}`);
    } catch (err) {
      toast.error("Couldn't start conversation", apiErrorMessage(err));
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState onRetry={loadProfile} title="Couldn't load this profile" />
      </div>
    );
  }

  if (!profile) {
    return <div className="glass mx-auto h-64 max-w-3xl animate-pulse rounded-2xl" />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} src={profile.profilePictureUrl} size={72} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-semibold">{profile.name}</h1>
                {profile.verificationStatus === "VERIFIED" && (
                  <ShieldCheck size={17} className="text-success" />
                )}
              </div>
              <p className="text-sm text-ink-muted">
                {profile.college}
                {profile.branch ? ` · ${profile.branch}` : ""}
                {profile.year ? ` · Year ${profile.year}` : ""}
              </p>
              <div className="mt-1 flex gap-4 text-xs text-ink-faint">
                <span>{profile.followersCount} followers</span>
                <span>{profile.followingCount} following</span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={following ? "outline" : "primary"}
                onClick={toggleFollow}
                disabled={followLoading}
              >
                {following ? <UserCheck size={15} className="mr-1" /> : <UserPlus size={15} className="mr-1" />}
                {following ? "Following" : "Follow"}
              </Button>
              <Button size="sm" variant="glass" onClick={messageUser}>
                <MessageCircle size={15} />
              </Button>
            </div>
          )}
          {isOwnProfile && (
            <Button size="sm" variant="outline" onClick={() => router.push("/profile/edit")}>
              Edit profile
            </Button>
          )}
        </div>

        {profile.bio && <p className="mt-4 text-sm">{profile.bio}</p>}

        {profile.interests.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.interests.map((i) => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
        )}
        {profile.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <Badge key={s} variant="accent">
                {s}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <h2 className="mt-8 font-display text-lg font-semibold">Posts</h2>
      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {!postsLoading && posts.length === 0 && (
          <EmptyState icon={FileText} title="No posts yet" description={isOwnProfile ? "Share something with your campus." : "Nothing posted here yet."} />
        )}
      </div>
    </div>
  );
}

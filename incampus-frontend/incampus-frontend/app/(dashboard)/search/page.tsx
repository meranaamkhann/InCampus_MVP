"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { api } from "@/lib/api";
import type { ApiResponse, CommunityDto, PageResponse, UserSummary } from "@/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [communities, setCommunities] = useState<CommunityDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    Promise.all([
      api.get<ApiResponse<PageResponse<UserSummary>>>("/users/search", { params: { query } }),
      api.get<ApiResponse<PageResponse<CommunityDto>>>("/communities", { params: { query } }),
    ])
      .then(([u, c]) => {
        setUsers(u.data.data.content);
        setCommunities(c.data.data.content);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">
        Results for <span className="text-primary">&quot;{query}&quot;</span>
      </h1>

      <Tabs.Root defaultValue="students" className="mt-6">
        <Tabs.List className="flex gap-2 border-b border-border/60">
          <Tabs.Trigger
            value="students"
            className="px-4 py-2 text-sm text-ink-muted data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Students ({users.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="communities"
            className="px-4 py-2 text-sm text-ink-muted data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Communities ({communities.length})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="students" className="mt-4 space-y-3">
          {users.map((u) => (
            <Link key={u.id} href={`/profile/${u.id}`}>
              <Card className="flex items-center gap-3 p-4">
                <Avatar name={u.name} src={u.profilePictureUrl} />
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-ink-faint">{u.college}</p>
                </div>
              </Card>
            </Link>
          ))}
          {!loading && users.length === 0 && <p className="text-sm text-ink-muted">No students found.</p>}
        </Tabs.Content>

        <Tabs.Content value="communities" className="mt-4 grid gap-4 sm:grid-cols-2">
          {communities.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
          {!loading && communities.length === 0 && <p className="text-sm text-ink-muted">No communities found.</p>}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}

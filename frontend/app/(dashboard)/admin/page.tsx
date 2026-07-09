"use client";

import { useEffect, useState } from "react";
import { Users, FileText, CalendarDays, Flag, ShieldAlert, Search, Ban, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { usePaginated } from "@/hooks/usePaginated";
import { api } from "@/lib/api";
import type { ApiResponse, PageResponse, UserProfile, UserSummary } from "@/types";

interface Analytics {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  totalPosts: number;
  totalCommunities: number;
  totalEvents: number;
  pendingReports: number;
}

interface ReportRow {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
}

function UserManagementPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PageResponse<UserSummary>>>("/users/search", { params: { query } });
      setResults(res.data.data.content);
      const details = await Promise.all(
        res.data.data.content.map((u) => api.get<ApiResponse<UserProfile>>(`/users/${u.id}`))
      );
      setProfiles(Object.fromEntries(details.map((d) => [d.data.data.id, d.data.data])));
    } finally {
      setLoading(false);
    }
  }

  async function toggleBan(userId: string, currentlyBanned: boolean) {
    setProfiles((prev) => ({ ...prev, [userId]: { ...prev[userId], banned: !currentlyBanned } }));
    if (currentlyBanned) await api.post(`/admin/users/${userId}/unban`);
    else await api.post(`/admin/users/${userId}/ban`);
  }

  return (
    <div>
      <h2 className="font-display text-lg font-semibold">User Management</h2>
      <form onSubmit={handleSearch} className="relative mt-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" size={16} />
        <Input
          placeholder="Search students by name or college…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="mt-4 space-y-3">
        {results.map((u) => {
          const profile = profiles[u.id];
          const banned = profile?.banned ?? false;
          return (
            <Card key={u.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} src={u.profilePictureUrl} />
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-ink-faint">{u.college}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={banned ? "outline" : "danger"}
                onClick={() => toggleBan(u.id, banned)}
                disabled={!profile}
              >
                {banned ? (
                  <>
                    <ShieldCheck size={14} className="mr-1" /> Unban
                  </>
                ) : (
                  <>
                    <Ban size={14} className="mr-1" /> Ban
                  </>
                )}
              </Button>
            </Card>
          );
        })}
        {!loading && query && results.length === 0 && <p className="text-sm text-ink-muted">No users found.</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const { items: reports, setItems: setReports } = usePaginated<ReportRow>("/admin/reports");

  useEffect(() => {
    api.get<ApiResponse<Analytics>>("/admin/analytics").then((res) => setAnalytics(res.data.data));
  }, []);

  async function resolve(reportId: string, decision: "ACTIONED" | "DISMISSED") {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    await api.post(`/admin/reports/${reportId}/resolve`, null, { params: { decision } });
  }

  const cards = analytics
    ? [
        { label: "Total users", value: analytics.totalUsers, icon: Users },
        { label: "Verified", value: analytics.verifiedUsers, icon: Users },
        { label: "Banned", value: analytics.bannedUsers, icon: ShieldAlert },
        { label: "Posts", value: analytics.totalPosts, icon: FileText },
        { label: "Events", value: analytics.totalEvents, icon: CalendarDays },
        { label: "Pending reports", value: analytics.pendingReports, icon: Flag },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-semibold">Admin Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <c.icon size={18} className="text-primary" />
            <p className="mt-2 font-mono text-xl font-semibold">{c.value}</p>
            <p className="text-xs text-ink-muted">{c.label}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold">Pending Reports</h2>
      <div className="mt-4 space-y-3">
        {reports.map((r) => (
          <Card key={r.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">
                {r.targetType} · <span className="font-mono text-xs text-ink-faint">{r.targetId}</span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">{r.reason}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => resolve(r.id, "DISMISSED")}>
                Dismiss
              </Button>
              <Button size="sm" variant="danger" onClick={() => resolve(r.id, "ACTIONED")}>
                Take action
              </Button>
            </div>
          </Card>
        ))}
        {reports.length === 0 && <p className="text-sm text-ink-muted">No pending reports. Nice.</p>}
      </div>

      <div className="mt-10">
        <UserManagementPanel />
      </div>
    </div>
  );
}

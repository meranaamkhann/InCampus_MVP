"use client";

import { useEffect, useState } from "react";
import { Users, FileText, CalendarDays, Flag, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePaginated } from "@/hooks/usePaginated";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

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
    </div>
  );
}

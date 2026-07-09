"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePaginated } from "@/hooks/usePaginated";
import { api, apiErrorMessage } from "@/lib/api";
import type { CommunityDto } from "@/types";

export default function CommunitiesPage() {
  const { items, setItems, loading, hasMore, sentinelRef } = usePaginated<CommunityDto>("/communities");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ data: CommunityDto }>("/communities", { name, description });
      setItems((prev) => [res.data.data, ...prev]);
      setName("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create community"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Communities</h1>
          <p className="mt-1 text-sm text-ink-muted">Coding, AI, Photography, Gym — find your people.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-1" /> New community
            </Button>
          </DialogTrigger>
          <DialogContent title="Create a community">
            <div className="space-y-4">
              <div>
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="c-desc">Description</Label>
                <Textarea id="c-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button className="w-full" onClick={handleCreate} disabled={submitting || !name.trim()}>
                {submitting ? "Creating…" : "Create community"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <CommunityCard key={c.id} community={c} />
        ))}
      </div>

      {loading && <p className="mt-6 text-center text-sm text-ink-muted">Loading…</p>}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CardSkeletonGrid } from "@/components/ui/skeleton";
import { usePaginated } from "@/hooks/usePaginated";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import type { CommunityDto } from "@/types";

export default function CommunitiesPage() {
  const { items, setItems, loading, error, hasMore, sentinelRef, retry } = usePaginated<CommunityDto>("/communities");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post<{ data: CommunityDto }>("/communities", { name, description });
      setItems((prev) => [res.data.data, ...prev]);
      toast.success("Community created", `"${name}" is ready for members to join.`);
      setName("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      const message = apiErrorMessage(err, "Couldn't create community");
      setFormError(message);
      toast.error("Couldn't create community", message);
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
              {formError && <p className="text-sm text-danger">{formError}</p>}
              <Button className="w-full" onClick={handleCreate} disabled={submitting || !name.trim()}>
                {submitting ? "Creating…" : "Create community"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <CardSkeletonGrid className="mt-6" />}

      {error && items.length === 0 && !loading && <ErrorState className="mt-6" onRetry={retry} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={Users}
          title="No communities yet"
          description="Start one for Coding, AI, Photography, or whatever your campus is into."
          className="mt-6"
        />
      )}

      {items.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

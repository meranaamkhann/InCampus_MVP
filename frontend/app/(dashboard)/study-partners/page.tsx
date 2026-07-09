"use client";

import { useState } from "react";
import { Plus, BookOpen, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { usePaginated } from "@/hooks/usePaginated";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import type { StudyPartnerPostDto } from "@/types";

function StudyPartnerCard({ post }: { post: StudyPartnerPostDto }) {
  const [joined, setJoined] = useState(false);
  const [count, setCount] = useState(post.participantCount);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    try {
      await api.post(`/study-partners/${post.id}/join`);
      setJoined(true);
      setCount((c) => c + 1);
      toast.success("Request sent", `${post.author.name} will see your interest in "${post.subject}".`);
    } catch (err) {
      toast.error("Couldn't send request", apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <h3 className="font-display text-base font-semibold">{post.subject}</h3>
        </div>
        {!post.open && <Badge variant="outline">Closed</Badge>}
      </div>
      <p className="mt-2 text-sm text-ink-muted">{post.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1 font-mono text-xs text-ink-faint">
          <Users size={12} /> {count} interested
        </span>
        <Button size="sm" variant={joined ? "outline" : "primary"} onClick={handleJoin} disabled={loading || joined || !post.open}>
          {joined ? "Requested" : "I'm interested"}
        </Button>
      </div>
    </Card>
  );
}

export default function StudyPartnersPage() {
  const { items, setItems, loading, error, hasMore, sentinelRef, retry } = usePaginated<StudyPartnerPostDto>("/study-partners");
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post<{ data: StudyPartnerPostDto }>("/study-partners", { subject, description });
      setItems((prev) => [res.data.data, ...prev]);
      toast.success("Posted!", "Your study partner request is live.");
      setSubject("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      const message = apiErrorMessage(err, "Couldn't post");
      setFormError(message);
      toast.error("Couldn't post", message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Study Partners</h1>
          <p className="mt-1 text-sm text-ink-muted">DSA, GATE, ML — find someone grinding the same thing.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-1" /> New post
            </Button>
          </DialogTrigger>
          <DialogContent title="Looking for a study partner">
            <div className="space-y-4">
              <div>
                <Label htmlFor="sp-subject">Subject</Label>
                <Input id="sp-subject" placeholder="e.g. DSA, GATE, Java" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sp-desc">What are you working on?</Label>
                <Textarea id="sp-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              {formError && <p className="text-sm text-danger">{formError}</p>}
              <Button className="w-full" onClick={handleCreate} disabled={submitting || !subject.trim()}>
                {submitting ? "Posting…" : "Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <ListSkeleton className="mt-6" />}

      {error && items.length === 0 && !loading && <ErrorState className="mt-6" onRetry={retry} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No study partner posts yet"
          description="Post what you're working on — DSA, GATE, ML — and find someone at your campus doing the same thing."
          className="mt-6"
        />
      )}

      {items.length > 0 && (
        <div className="mt-6 space-y-4">
          {items.map((p) => (
            <StudyPartnerCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

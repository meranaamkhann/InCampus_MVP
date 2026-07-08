"use client";

import { useState } from "react";
import { Plus, Rocket, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePaginated } from "@/hooks/usePaginated";
import { api, apiErrorMessage } from "@/lib/api";
import type { ProjectCardDto } from "@/types";

function ProjectCard({ project }: { project: ProjectCardDto }) {
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  async function handleRequest() {
    setLoading(true);
    try {
      await api.post(`/projects/${project.id}/join-requests`, { message });
      setRequested(true);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Rocket size={16} className="text-accent" />
        <h3 className="font-display text-base font-semibold">{project.title}</h3>
      </div>
      <p className="mt-2 text-sm text-ink-muted">{project.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.rolesNeeded.map((role) => (
          <Badge key={role} variant="accent">
            {role}
          </Badge>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="mt-4 w-full" variant={requested ? "outline" : "primary"} disabled={requested || !project.open}>
            {requested ? "Request sent" : "Request to join"}
          </Button>
        </DialogTrigger>
        <DialogContent title={`Join "${project.title}"`}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="join-message">A short note to the team (optional)</Label>
              <Textarea
                id="join-message"
                rows={3}
                placeholder="What role are you interested in, and why?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleRequest} disabled={loading}>
              {loading ? "Sending…" : "Send request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function ProjectsPage() {
  const { items, setItems, loading, hasMore, sentinelRef } = usePaginated<ProjectCardDto>("/projects");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roles, setRoles] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ data: ProjectCardDto }>("/projects", {
        title,
        description,
        rolesNeeded: roles.filter(Boolean),
      });
      setItems((prev) => [res.data.data, ...prev]);
      setTitle("");
      setDescription("");
      setRoles([""]);
      setOpen(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create project"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Project Teams</h1>
          <p className="mt-1 text-sm text-ink-muted">Hackathon teams, side projects, roles to fill.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-1" /> New project
            </Button>
          </DialogTrigger>
          <DialogContent title="Post a project">
            <div className="space-y-4">
              <div>
                <Label htmlFor="p-title">Title</Label>
                <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="p-desc">Description</Label>
                <Textarea id="p-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Roles needed</Label>
                <div className="space-y-2">
                  {roles.map((role, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder="e.g. Frontend Developer"
                        value={role}
                        onChange={(e) => setRoles((r) => r.map((x, idx) => (idx === i ? e.target.value : x)))}
                      />
                      {roles.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => setRoles((r) => r.filter((_, idx) => idx !== i))}>
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setRoles((r) => [...r, ""])} className="text-xs text-primary hover:underline">
                    + Add role
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button className="w-full" onClick={handleCreate} disabled={submitting || !title.trim()}>
                {submitting ? "Posting…" : "Post project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {loading && <p className="mt-6 text-center text-sm text-ink-muted">Loading…</p>}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

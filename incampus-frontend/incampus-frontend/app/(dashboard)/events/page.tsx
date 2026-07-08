"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePaginated } from "@/hooks/usePaginated";
import { api, apiErrorMessage } from "@/lib/api";
import type { EventDto, EventCategory } from "@/types";

const CATEGORIES: EventCategory[] = ["TECH", "CULTURAL", "SPORTS", "WORKSHOP", "HACKATHON", "SEMINAR", "OTHER"];

export default function EventsPage() {
  const { items, setItems, loading, hasMore, sentinelRef } = usePaginated<EventDto>("/events/upcoming");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    maxParticipants: "",
    category: "TECH" as EventCategory,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ data: EventDto }>("/events", {
        ...form,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      });
      setItems((prev) => [res.data.data, ...prev]);
      setOpen(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create event"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Upcoming Events</h1>
          <p className="mt-1 text-sm text-ink-muted">Workshops, hackathons, and fests happening on campus.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-1" /> New event
            </Button>
          </DialogTrigger>
          <DialogContent title="Create an event" className="max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label htmlFor="e-title">Title</Label>
                <Input id="e-title" value={form.title} onChange={(e) => update("title", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="e-desc">Description</Label>
                <Textarea id="e-desc" rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="e-date">Date</Label>
                  <Input id="e-date" type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="e-time">Time</Label>
                  <Input id="e-time" type="time" value={form.eventTime} onChange={(e) => update("eventTime", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="e-location">Location</Label>
                <Input id="e-location" value={form.location} onChange={(e) => update("location", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="e-max">Max participants</Label>
                  <Input
                    id="e-max"
                    type="number"
                    value={form.maxParticipants}
                    onChange={(e) => update("maxParticipants", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="e-category">Category</Label>
                  <select
                    id="e-category"
                    className="flex h-11 w-full rounded-xl border border-border bg-bg-surface/60 px-3 text-sm outline-none focus:border-primary"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value as EventCategory)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button className="w-full" onClick={handleCreate} disabled={submitting || !form.title.trim() || !form.eventDate}>
                {submitting ? "Creating…" : "Create event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>

      {loading && <p className="mt-6 text-center text-sm text-ink-muted">Loading…</p>}
      {!loading && items.length === 0 && (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-ink-muted">
          No upcoming events yet. Be the first to organize one.
        </div>
      )}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}

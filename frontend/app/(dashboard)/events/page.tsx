"use client";

import { useState } from "react";
import { Plus, List, Map as MapIcon, CalendarDays } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { EventsMap } from "@/components/events/EventsMap";
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
import type { EventDto, EventCategory } from "@/types";

const CATEGORIES: EventCategory[] = ["TECH", "CULTURAL", "SPORTS", "WORKSHOP", "HACKATHON", "SEMINAR", "OTHER"];

export default function EventsPage() {
  const { items, setItems, loading, error, hasMore, sentinelRef, retry } = usePaginated<EventDto>("/events/upcoming");
  const [view, setView] = useState<"list" | "map">("list");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    latitude: "",
    longitude: "",
    maxParticipants: "",
    category: "TECH" as EventCategory,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate() {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post<{ data: EventDto }>("/events", {
        ...form,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });
      setItems((prev) => [res.data.data, ...prev]);
      toast.success("Event created", `"${form.title}" is now live on the events page.`);
      setOpen(false);
    } catch (err) {
      const message = apiErrorMessage(err, "Couldn't create event");
      setFormError(message);
      toast.error("Couldn't create event", message);
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
        <div className="flex items-center gap-2">
          <div className="glass flex rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={`rounded-lg p-2 ${view === "list" ? "bg-primary/15 text-primary" : "text-ink-muted"}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setView("map")}
              className={`rounded-lg p-2 ${view === "map" ? "bg-primary/15 text-primary" : "text-ink-muted"}`}
              aria-label="Map view"
            >
              <MapIcon size={16} />
            </button>
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
                    <Label htmlFor="e-lat">Latitude (optional, for map)</Label>
                    <Input id="e-lat" type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="e-lng">Longitude (optional, for map)</Label>
                    <Input id="e-lng" type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} />
                  </div>
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
                {formError && <p className="text-sm text-danger">{formError}</p>}
                <Button className="w-full" onClick={handleCreate} disabled={submitting || !form.title.trim() || !form.eventDate}>
                  {submitting ? "Creating…" : "Create event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === "map" ? (
        <div className="mt-6">
          <EventsMap events={items} />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}

      {loading && view === "list" && <CardSkeletonGrid className="mt-6" />}

      {error && items.length === 0 && !loading && <ErrorState className="mt-6" onRetry={retry} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming events yet"
          description="Be the first to organize a workshop, hackathon, or meetup for your campus."
          className="mt-6"
        />
      )}
      {view === "list" && hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}


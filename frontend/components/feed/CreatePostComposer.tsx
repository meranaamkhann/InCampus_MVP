"use client";

import { useRef, useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import { useAuthStore } from "@/lib/auth-store";
import type { Post, PostType } from "@/types";

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "QUESTION", label: "Question" },
  { value: "POLL", label: "Poll" },
  { value: "STUDY_REQUEST", label: "Study Request" },
  { value: "PROJECT_REQUEST", label: "Project Request" },
  { value: "COFFEE_INVITE", label: "Coffee Invite" },
  { value: "MOVIE_PLAN", label: "Movie Plan" },
  { value: "SPORTS_INVITE", label: "Sports Invite" },
];

export function CreatePostComposer({ onCreated }: { onCreated: (post: Post) => void }) {
  const name = useAuthStore((s) => s.name) ?? "?";
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("TEXT");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<{ data: string }>("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(res.data.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  }

  function updatePollOption(i: number, value: string) {
    setPollOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }

  function reset() {
    setContent("");
    setType("TEXT");
    setPollOptions(["", ""]);
    setImageUrl("");
    setExpanded(false);
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { type, content };
      if (type === "POLL") payload.pollOptions = pollOptions.filter(Boolean);
      if (imageUrl) payload.imageUrls = [imageUrl];

      const res = await api.post<{ data: Post }>("/posts", payload);
      onCreated(res.data.data);
      toast.success("Posted!", "Your post is now live on the campus feed.");
      reset();
    } catch (err) {
      const message = apiErrorMessage(err, "Couldn't publish your post");
      setError(message);
      toast.error("Couldn't post", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex gap-3">
        <Avatar name={name} size={40} />
        <div className="flex-1">
          <Textarea
            placeholder="What's happening on campus?"
            rows={expanded ? 3 : 1}
            value={content}
            onFocus={() => setExpanded(true)}
            onChange={(e) => setContent(e.target.value)}
          />

          {expanded && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {POST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-medium transition " +
                      (type === t.value
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-ink-muted hover:bg-white/5")
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {type === "POLL" && (
                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <Input
                      key={i}
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                    />
                  ))}
                  <button
                    onClick={() => setPollOptions((o) => [...o, ""])}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus size={13} /> Add option
                  </button>
                </div>
              )}

              {type === "IMAGE" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {imageUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="" className="max-h-48 rounded-xl object-cover" />
                      <button
                        onClick={() => setImageUrl("")}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <ImagePlus size={14} className="mr-1.5" />
                      {uploading ? "Uploading…" : "Choose an image"}
                    </Button>
                  )}
                </div>
              )}

              {error && <p className="text-sm text-danger">{error}</p>}

              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={reset}>
                  <X size={14} className="mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={loading || uploading || (!content.trim() && !imageUrl)}>
                  {loading ? "Posting…" : "Post"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

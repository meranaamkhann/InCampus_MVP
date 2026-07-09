"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import { useAuthStore } from "@/lib/auth-store";
import type { ApiResponse, UserProfile } from "@/types";

export default function EditProfilePage() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    branch: "",
    year: "",
    interests: "",
    skills: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    api.get<ApiResponse<UserProfile>>(`/users/${userId}`).then((res) => {
      const p = res.data.data;
      setForm({
        name: p.name,
        bio: p.bio ?? "",
        branch: p.branch ?? "",
        year: p.year?.toString() ?? "",
        interests: p.interests.join(", "),
        skills: p.skills.join(", "),
      });
      setLoaded(true);
    });
  }, [userId]);

  function update<K extends keyof typeof form>(field: K, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.put(`/users/me`, {
        name: form.name,
        bio: form.bio,
        branch: form.branch,
        year: form.year ? Number(form.year) : undefined,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      router.push(`/profile/${userId}`);
      toast.success("Profile updated");
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't save changes"));
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <div className="glass mx-auto h-64 max-w-lg animate-pulse rounded-2xl" />;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-semibold">Edit profile</h1>
      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" value={form.branch} onChange={(e) => update("branch", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={form.year} onChange={(e) => update("year", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="interests">Interests (comma separated)</Label>
            <Input id="interests" value={form.interests} onChange={(e) => update("interests", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input id="skills" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

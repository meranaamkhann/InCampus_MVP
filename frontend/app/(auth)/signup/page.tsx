"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

const STEPS = ["Account", "College"] as const;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    branch: "",
    year: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateStep(index: number): string | null {
    if (index === 0) {
      if (!form.name.trim()) return "Enter your name";
      if (!form.email.trim()) return "Enter your college email";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email";
      if (form.password.length < 8) return "Password must be at least 8 characters";
    }
    if (index === 1) {
      if (!form.college.trim()) return "Enter your college name";
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/signup", {
        ...form,
        year: form.year ? Number(form.year) : undefined,
      });
      toast.success("Almost there!", "Check your college email for a verification code.");
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create your account"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Only college emails (.edu / .ac.in) can join InCampus.
      </p>

      {/* Progress indicator */}
      <div className="mt-5 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition",
                i <= step ? "bg-primary text-primary-foreground" : "bg-bg-surface text-ink-faint border border-border"
              )}
            >
              {i + 1}
            </div>
            <span className={cn("text-xs font-medium", i <= step ? "text-ink" : "text-ink-faint")}>{label}</span>
            {i < STEPS.length - 1 && <div className={cn("h-px flex-1", i < step ? "bg-primary" : "bg-border")} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {step === 0 && (
          <>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">College email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@college.edu"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <Label htmlFor="college">College</Label>
              <Input id="college" required value={form.college} onChange={(e) => update("college", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" value={form.branch} onChange={(e) => update("branch", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" min={1} max={6} value={form.year} onChange={(e) => update("year", e.target.value)} />
              </div>
            </div>
          </>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={goBack} className="flex-1">
              <ArrowLeft size={15} className="mr-1.5" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="flex-1">
              Next <ArrowRight size={15} className="ml-1.5" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already verified?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

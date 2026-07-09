"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/OtpInput";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast-store";
import { useAuth, apiErrorMessage } from "@/hooks/useAuth";

const RESEND_COOLDOWN_SECONDS = 30;

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const { verifyOtp } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const submit = useCallback(
    async (code: string) => {
      if (code.length !== 6 || !email) return;
      setError(null);
      setLoading(true);
      try {
        await verifyOtp(email, code);
        toast.success("Verified!", "Welcome to InCampus.");
      } catch (err) {
        setError(apiErrorMessage(err, "Invalid or expired code"));
      } finally {
        setLoading(false);
      }
    },
    [email, verifyOtp]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(otp);
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError(null);
    try {
      await api.post("/auth/resend-otp", { email });
      toast.success("Code resent", "Check your college email for the new code.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <MailCheck size={22} />
      </div>
      <h1 className="text-center font-display text-2xl font-semibold">Verify your email</h1>
      <p className="mt-1 text-center text-sm text-ink-muted">
        We sent a 6-digit code to your college email. It expires in 10 minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Label htmlFor="email">College email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <Label className="text-center">Verification code</Label>
          <OtpInput value={otp} onChange={setOtp} onComplete={submit} disabled={loading} />
        </div>

        {error && <p className="text-center text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>
      </form>

      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        className="mt-4 w-full text-center text-sm text-primary hover:underline disabled:text-ink-faint disabled:no-underline"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}

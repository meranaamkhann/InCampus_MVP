"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth, apiErrorMessage } from "@/hooks/useAuth";

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const { verifyOtp } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(email, otp);
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid or expired code"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      await api.post("/auth/resend-otp", { email });
      setInfo("A new code has been sent.");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Verify your email</h1>
      <p className="mt-1 text-sm text-ink-muted">
        We sent a 6-digit code to your college email. It expires in 10 minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">College email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="text-center font-mono text-lg tracking-[0.5em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {info && <p className="text-sm text-success">{info}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>
      </form>

      <button onClick={handleResend} className="mt-4 w-full text-center text-sm text-primary hover:underline">
        Resend code
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

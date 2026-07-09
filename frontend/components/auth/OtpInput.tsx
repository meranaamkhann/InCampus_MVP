"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(Array.from({ length }, (_, i) => value[i] ?? ""));

  useEffect(() => {
    setDigits(Array.from({ length }, (_, i) => value[i] ?? ""));
  }, [value, length]);

  function updateDigits(next: string[]) {
    setDigits(next);
    const joined = next.join("");
    onChange(joined);
    if (joined.length === length && next.every(Boolean)) {
      onComplete?.(joined);
    }
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    updateDigits(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    updateDigits(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-11 rounded-xl border border-border bg-bg-surface/60 text-center font-mono text-lg outline-none transition",
            "focus:border-primary focus:ring-1 focus:ring-primary",
            digit && "border-primary/60"
          )}
        />
      ))}
    </div>
  );
}

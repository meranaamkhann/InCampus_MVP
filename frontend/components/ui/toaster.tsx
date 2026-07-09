"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/lib/toast-store";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  default: Info,
};

const accentClass = {
  success: "border-success/40 text-success",
  error: "border-danger/40 text-danger",
  default: "border-primary/40 text-primary",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4500}>
      {toasts.map((t) => {
        const Icon = icons[t.variant];
        return (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => !open && dismiss(t.id)}
            className={cn(
              "glass data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=closed]:fade-out",
              "flex items-start gap-3 rounded-2xl border p-4 shadow-glass",
              accentClass[t.variant]
            )}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-medium text-ink">{t.title}</ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-0.5 text-xs text-ink-muted">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="text-ink-faint hover:text-ink">
              <X size={14} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 outline-none sm:bottom-6 sm:right-6" />
    </ToastPrimitive.Provider>
  );
}

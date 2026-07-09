"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  GraduationCap,
  X,
  BookOpen,
  Rocket,
  UserPlus,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

const moreLinks = [
  { href: "/study-partners", label: "Study Partners", icon: BookOpen },
  { href: "/projects", label: "Projects", icon: Rocket },
  { href: "/friends", label: "Friends", icon: UserPlus },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function MobileDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden" />
        <DialogPrimitive.Content
          className={cn(
            "glass fixed inset-y-0 left-0 z-50 flex w-72 flex-col p-5 shadow-glass md:hidden",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-left",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left"
          )}
        >
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="flex items-center gap-2 font-display text-lg font-semibold">
              <GraduationCap className="text-primary" size={20} />
              InCampus
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-lg p-1 text-ink-muted hover:bg-white/10">
              <X size={18} />
            </DialogPrimitive.Close>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {moreLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-primary/15 text-primary" : "text-ink-muted hover:bg-white/5 hover:text-ink"
                  )}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}

            {(role === "ADMIN" || role === "MODERATOR") && (
              <Link
                href="/admin"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "mt-4 flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-white/5 hover:text-ink",
                  pathname.startsWith("/admin") && "bg-accent/15 text-accent border-accent/30"
                )}
              >
                <ShieldCheck size={18} />
                Admin
              </Link>
            )}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, MessagesSquare, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

const links = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/messages", label: "Chat", icon: MessagesSquare },
];

/**
 * Fixed bottom tab bar, mobile-only (md:hidden). The full Sidebar is
 * desktop-only (hidden below md) - without this, phones had literally no
 * way to navigate the dashboard at all.
 */
export function MobileNav() {
  const pathname = usePathname();
  const userId = useAuthStore((s) => s.userId);

  const allLinks = [...links, { href: userId ? `/profile/${userId}` : "/feed", label: "Profile", icon: UserCircle }];

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border/60 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden">
      {allLinks.map((link) => {
        const active = pathname.startsWith(link.href.split("/").slice(0, 2).join("/"));
        return (
          <Link
            key={link.label}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition",
              active ? "text-primary" : "text-ink-faint"
            )}
          >
            <link.icon size={20} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

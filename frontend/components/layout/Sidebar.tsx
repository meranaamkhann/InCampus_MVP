"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Home,
  CalendarDays,
  Users,
  MessagesSquare,
  Bell,
  BookOpen,
  Rocket,
  UserCircle,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

const links = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/communities", label: "Communities", icon: Users },
  { href: "/friends", label: "Friends", icon: UserPlus },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/study-partners", label: "Study Partners", icon: BookOpen },
  { href: "/projects", label: "Projects", icon: Rocket },
  { href: "/messages", label: "Messages", icon: MessagesSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.userId);

  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between p-5 md:flex">
      <div>
        <Link href="/feed" className="flex items-center gap-2 px-2 font-display text-lg font-semibold">
          <GraduationCap className="text-primary" size={22} />
          InCampus
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
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

          {role === "ADMIN" || role === "MODERATOR" ? (
            <Link
              href="/admin"
              className={cn(
                "mt-4 flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-white/5 hover:text-ink",
                pathname.startsWith("/admin") && "bg-accent/15 text-accent border-accent/30"
              )}
            >
              <ShieldCheck size={18} />
              Admin
            </Link>
          ) : null}
        </nav>
      </div>

      <Link
        href={userId ? `/profile/${userId}` : "/feed"}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-white/5 hover:text-ink",
          pathname.startsWith("/profile") && "bg-primary/15 text-primary"
        )}
      >
        <UserCircle size={18} />
        My Profile
      </Link>
    </aside>
  );
}

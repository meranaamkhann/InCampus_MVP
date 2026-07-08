"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sun, Moon, Bell, LogOut } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useTheme } from "@/lib/theme-provider";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { name, clearSession } = useAuthStore();
  const [unread, setUnread] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await api.get<ApiResponse<number>>("/notifications/unread-count");
        if (!cancelled) setUnread(res.data.data);
      } catch {
        // silent - unread badge just won't update this cycle
      }
    }
    poll();
    const id = setInterval(poll, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  }

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3">
      <form onSubmit={handleSearch} className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" size={16} />
        <Input
          placeholder="Search students, clubs, events…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-ink-muted hover:bg-white/5 hover:text-ink"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={() => router.push("/notifications")}
          className="relative rounded-xl p-2 text-ink-muted hover:bg-white/5 hover:text-ink"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="outline-none">
            <Avatar name={name ?? "?"} size={36} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="glass min-w-40 rounded-xl p-1.5 text-sm shadow-glass"
            >
              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-danger outline-none hover:bg-danger/10"
              >
                <LogOut size={15} /> Log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}

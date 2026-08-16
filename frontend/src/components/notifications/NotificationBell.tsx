"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/cn";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    refreshNotifications();
    const interval = window.setInterval(refreshNotifications, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  async function refreshNotifications() {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setItems([]);
      setUnreadCount(0);
    }
  }

  async function markRead(id: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item)));
    setUnreadCount((count) => Math.max(0, count - 1));
    await fetch(`/api/notifications/${id}/read`, { method: "POST" }).catch(() => null);
  }

  async function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "POST" }).catch(() => null);
  }

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-11 w-11 place-items-center rounded-full border border-violet-400/25 bg-surface-card/90 text-ink/78 shadow-card backdrop-blur-xl transition hover:bg-violet-50 hover:text-ink"
        aria-label="Open notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-black leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-[8px] border border-violet-200/18 bg-[#120522] text-white shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-200">Notifications</p>
              <p className="mt-1 text-sm text-white/55">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-black text-white/75 transition hover:bg-white/8"
            >
              <CheckCheck size={14} />
              Read all
            </button>
          </div>

          <div className="max-h-[430px] overflow-auto p-2">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-white/55">No notifications yet.</p>
            ) : (
              items.map((item) => {
                const content = (
                  <span className={cn("block rounded-[8px] border p-3 transition hover:bg-white/[0.055]", item.readAt ? "border-white/8 bg-black/15" : "border-violet-300/22 bg-violet-500/12")}>
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-black text-white">{item.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-white/62">{item.body}</span>
                      </span>
                      {!item.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400" />}
                    </span>
                    <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </span>
                );

                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      markRead(item.id);
                      setOpen(false);
                    }}
                    className="block p-1"
                  >
                    {content}
                  </Link>
                ) : (
                  <button key={item.id} type="button" onClick={() => markRead(item.id)} className="block w-full p-1 text-left">
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

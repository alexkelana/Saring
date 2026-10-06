"use client";

import { Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatJakarta, formatPrice } from "@/lib/screener/format";
import { useDesk, type AlertKind } from "@/lib/screener/desk-store";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<AlertKind, string> = {
  above: "di atas",
  below: "di bawah",
  change: "gerak ≥",
};

export function NoticeBell() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"inbox" | "alerts">("inbox");
  const notices = useDesk((s) => s.notices);
  const alerts = useDesk((s) => s.alerts);
  const screenPing = useDesk((s) => s.screenPing);
  const unread = useMemo(() => notices.filter((n) => !n.read).length, [notices]);
  const markAllRead = useDesk((s) => s.markAllRead);
  const markRead = useDesk((s) => s.markRead);
  const clearNotices = useDesk((s) => s.clearNotices);
  const removeAlert = useDesk((s) => s.removeAlert);
  const toggleAlert = useDesk((s) => s.toggleAlert);
  const setScreenPing = useDesk((s) => s.setScreenPing);

  const requestPush = async () => {
    if (typeof Notification === "undefined") {
      toast.message("Browser ini tidak mendukung notifikasi sistem.");
      return;
    }
    const perm = await Notification.requestPermission();
    toast.message(perm === "granted" ? "Notifikasi browser aktif." : "Izin notifikasi ditolak.");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setTab("inbox");
        }}
        className="relative grid size-11 place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
        aria-label={unread ? `${unread} notifikasi belum dibaca` : "Notifikasi"}
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-up" />
        ) : null}
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-background/70"
            aria-label="Tutup notifikasi"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-3 top-20 z-50 max-h-[min(72vh,36rem)] overflow-y-auto rounded-3xl bg-card p-4 shadow-[var(--shadow-border)] sm:inset-x-auto sm:right-6 sm:w-[24rem]">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-xl tracking-tight">Notifikasi</p>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={cn(
                    "h-9 rounded-full px-3 text-sm",
                    tab === "inbox" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                  onClick={() => setTab("inbox")}
                >
                  Kotak
                </button>
                <button
                  type="button"
                  className={cn(
                    "h-9 rounded-full px-3 text-sm",
                    tab === "alerts" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                  onClick={() => setTab("alerts")}
                >
                  Alert
                </button>
              </div>
            </div>

            {tab === "inbox" ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={markAllRead} disabled={!unread}>
                    Tandai dibaca
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearNotices} disabled={!notices.length}>
                    Hapus
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void requestPush()}>
                    Izin browser
                  </Button>
                </div>
                <label className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-3 py-2.5 text-sm">
                  <span>Beritahu hasil screening beli</span>
                  <input
                    type="checkbox"
                    checked={screenPing}
                    onChange={(e) => setScreenPing(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                </label>
                {notices.length === 0 ? (
                  <p className="py-8 text-sm text-muted-foreground">
                    Belum ada notifikasi. Pasang alert harga, atau jalankan screening.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {notices.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={cn(
                            "w-full rounded-2xl px-3 py-3 text-left shadow-[var(--shadow-border)]",
                            n.read ? "bg-secondary/60" : "bg-accent",
                          )}
                          onClick={() => markRead(n.id)}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">{formatJakarta(n.at)}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Alert dipantau saat app terbuka. Dari detail saham, pasang alert di target atau stop.
                </p>
                {alerts.length === 0 ? (
                  <p className="py-8 text-sm text-muted-foreground">Belum ada alert harga.</p>
                ) : (
                  <ul className="space-y-2">
                    {alerts.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{a.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {KIND_LABEL[a.kind]}{" "}
                            {a.kind === "change" ? `${a.value}%` : formatPrice(a.value)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={cn(
                            "h-9 rounded-full px-3 text-sm",
                            a.enabled ? "bg-up/15 text-up" : "text-muted-foreground",
                          )}
                          onClick={() => toggleAlert(a.id)}
                        >
                          {a.enabled ? "On" : "Off"}
                        </button>
                        <button
                          type="button"
                          className="h-9 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => removeAlert(a.id)}
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}

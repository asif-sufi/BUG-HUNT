"use client";

import { Menu, ShieldCheck, ShieldX } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";

export function DashboardShell({
  verified,
  domain,
  children
}: {
  verified: boolean;
  domain: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <button aria-label="Open menu" className="rounded border border-slate-700 p-2 lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-4 w-4" />
            </button>
            <input id="global-search" aria-label="Search tools" placeholder="Search tools... (Ctrl+K)" className="rounded border border-slate-700 bg-slate-900 px-3 py-2" />
            <span className="text-sm text-slate-300">Domain: {domain || "not set"}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${verified ? "bg-emerald-800/40 text-emerald-300" : "bg-amber-900/30 text-amber-300"}`}>
              {verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
              {verified ? "Verified" : "Unverified"}
            </span>
          </div>
        </header>
        <div className="p-4">{children}</div>
        <div aria-live="polite" className="sr-only" id="toast-region" />
      </main>
    </div>
  );
}

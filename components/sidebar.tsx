"use client";

import { Shield, Workflow, Wrench, FileText, Search } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const links = [
  { href: "/app", label: "Dashboard", icon: Shield },
  { href: "/app/tools", label: "Tools", icon: Wrench },
  { href: "/app/workflows", label: "Workflows", icon: Workflow },
  { href: "/app/reports", label: "Reports", icon: FileText }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const fn = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const el = document.getElementById("global-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <>
      <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 p-4 lg:block">
        <nav className="space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-md p-2 hover:bg-slate-800">
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose}>
          <aside className="h-full w-64 border-r border-slate-800 bg-slate-900 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-2 text-slate-300"><Search className="h-4 w-4" />Menu</div>
            <nav className="space-y-2">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={onClose} className="flex items-center gap-2 rounded-md p-2 hover:bg-slate-800">
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

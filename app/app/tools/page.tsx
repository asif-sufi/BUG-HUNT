"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ToolCard } from "@/components/tool-card";
import { toolsSeed } from "@/data/tools.seed";

export default function ToolsPage() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const visible = useMemo(() => toolsSeed.filter((tool) => tool.name.toLowerCase().includes(query.toLowerCase())), [query]);

  const exportJson = () => {
    const payload = JSON.stringify({ favorites, tools: toolsSeed.map((t) => ({ id: t.id, template: "" })) }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "studio-tools.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell verified={false} domain="">
      <div className="mb-4 flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Filter tools" />
        <button onClick={exportJson} className="rounded border border-slate-700 px-3 py-2">Export JSON</button>
        <label className="rounded border border-slate-700 px-3 py-2">Import JSON<input type="file" className="hidden" onChange={() => setFavorites([])} /></label>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.length === 0 ? <p className="text-slate-400">No tools matched your search.</p> : visible.slice(0, 60).map((tool) => (
          <div key={tool.id}>
            <button className="mb-1 text-xs text-amber-300" onClick={() => setFavorites((f) => f.includes(tool.id) ? f.filter((id) => id !== tool.id) : [...f, tool.id])}>{favorites.includes(tool.id) ? "★ Favorited" : "☆ Favorite"}</button>
            <ToolCard tool={tool} disabled />
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

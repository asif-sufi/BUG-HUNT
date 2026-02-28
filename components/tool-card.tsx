import type { Tool } from "@/types/models";

export function ToolCard({ tool, disabled }: { tool: Tool; disabled: boolean }) {
  return (
    <article className="card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{tool.name}</h3>
        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs">{tool.mode}</span>
      </div>
      <p className="text-sm text-slate-400">{tool.category}</p>
      <div className="flex flex-wrap gap-1">
        {tool.tags.map((tag) => (
          <span key={tag} className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">#{tag}</span>
        ))}
      </div>
      <textarea
        aria-label={`${tool.name} template slot`}
        placeholder="User-provided template slot only"
        className="min-h-20 w-full rounded border border-slate-700 bg-slate-950 p-2 text-sm"
        disabled={disabled && tool.mode === "active"}
      />
      {tool.mode === "active" && (
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" className="rounded" /> I confirm I have authorization.
        </label>
      )}
    </article>
  );
}

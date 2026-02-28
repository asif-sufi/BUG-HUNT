import { DashboardShell } from "@/components/dashboard-shell";
import { normalizeHostnames, normalizeUrls, uniqueByKey, excludeRegex, includeRegex, onlyHttps, onlyStatus, sortStable } from "@/lib/transforms";

export default function WorkflowsPage() {
  const preview = {
    normalizeHostnames: normalizeHostnames(["Example.com.", "api.EXAMPLE.com"]),
    normalizeUrls: normalizeUrls(["https://Example.com/path/", "http://example.com/login"]),
    uniqueByKey: uniqueByKey([{ key: "a" }, { key: "a" }, { key: "b" }], "key"),
    excludeRegex: excludeRegex(["prod.example.com", "dev.example.com"], "^dev"),
    includeRegex: includeRegex(["prod.example.com", "dev.example.com"], "^dev"),
    onlyHttps: onlyHttps(["https://a.com", "http://b.com"]),
    onlyStatus: onlyStatus([{ status: 200 }, { status: 404 }], 200),
    sortStable: sortStable(["z", "a", "b"])
  };

  return (
    <DashboardShell verified={false} domain="">
      <section className="card">
        <h1 className="mb-2 text-xl font-semibold">Workflow Planner (Transforms Only)</h1>
        <p className="mb-3 text-sm text-slate-300">No exploit automation is included. Workflows are data transforms over known inputs.</p>
        <pre className="overflow-x-auto text-xs text-slate-300">{JSON.stringify(preview, null, 2)}</pre>
      </section>
    </DashboardShell>
  );
}

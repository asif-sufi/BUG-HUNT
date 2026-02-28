import { DashboardShell } from "@/components/dashboard-shell";

export default function ReportsPage() {
  return (
    <DashboardShell verified={false} domain="">
      <section className="card space-y-2">
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="text-sm text-slate-300">Export posture checks, templates, favorites, and workflow plans as JSON.</p>
        <p className="text-xs text-slate-400">Audit logs are privacy-preserving and store a salted hash for domains.</p>
      </section>
    </DashboardShell>
  );
}

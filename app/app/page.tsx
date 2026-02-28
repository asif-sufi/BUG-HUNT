"use client";

import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

interface DnsAnswer { data: string; }

export default function AppDashboardPage() {
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [results, setResults] = useState<string>("");

  const disabledMsg = useMemo(() => (verified ? "Active modules available" : "Verification required for active actions"), [verified]);

  const startVerification = async () => {
    const res = await fetch("/api/verify/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain }) });
    const data = await res.json();
    setToken(data.token ?? "");
  };

  const checkVerification = async () => {
    const res = await fetch("/api/verify/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain, token }) });
    const data = await res.json();
    setVerified(Boolean(data.verified));
  };

  const runEmailAuth = async () => {
    const res = await fetch("/api/posture/email-auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain, dkimSelector: "default" }) });
    setResults(JSON.stringify(await res.json(), null, 2));
  };

  const runHttpPosture = async () => {
    const res = await fetch("/api/posture/http", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain }) });
    setResults(JSON.stringify(await res.json(), null, 2));
  };

  const runTlsPosture = async () => {
    const res = await fetch("/api/posture/tls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain }) });
    setResults(JSON.stringify(await res.json(), null, 2));
  };

  const runDnsBaseline = async () => {
    const types = ["A", "AAAA", "CNAME", "NS", "MX", "TXT"];
    const fetched = await Promise.all(types.map(async (type) => {
      const res = await fetch(`/api/dns?name=${encodeURIComponent(domain)}&type=${type}`);
      const data = await res.json();
      return [type, (data.answers as DnsAnswer[] | undefined)?.map((a) => a.data) ?? []] as const;
    }));
    setResults(JSON.stringify(Object.fromEntries(fetched), null, 2));
  };

  return (
    <DashboardShell verified={verified} domain={domain}>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Ownership Verification Gate</h2>
          <label className="block text-sm">Domain
            <input value={domain} onChange={(e) => setDomain(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="example.com" />
          </label>
          <button onClick={startVerification} className="rounded bg-indigo-600 px-3 py-2">Generate token</button>
          {token && <p className="text-xs text-slate-300">Add DNS TXT: <code>_verify-studio.{domain} = {token}</code></p>}
          <button onClick={checkVerification} className="rounded border border-slate-700 px-3 py-2">Check verification</button>
        </div>
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Safe Posture Modules</h2>
          <p className="text-sm text-slate-300">{disabledMsg}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={runDnsBaseline} className="rounded border border-slate-700 px-2 py-2">DNS Baseline</button>
            <button onClick={runEmailAuth} className="rounded border border-slate-700 px-2 py-2">Email Auth</button>
            <button onClick={runHttpPosture} className="rounded border border-slate-700 px-2 py-2">HTTP Posture</button>
            <button onClick={runTlsPosture} className="rounded border border-slate-700 px-2 py-2">TLS Posture</button>
          </div>
        </div>
      </section>
      <section className="card mt-4">
        <h2 className="mb-2 text-lg font-semibold">Results</h2>
        {results ? <pre className="overflow-x-auto text-xs text-slate-300">{results}</pre> : <p className="text-sm text-slate-400">No results yet.</p>}
      </section>
    </DashboardShell>
  );
}

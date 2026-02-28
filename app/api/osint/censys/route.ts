import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/http";
import { osintSchema } from "@/lib/schemas";
import { env } from "@/lib/env";
import { ensureVerified } from "@/lib/osint";
import { writeAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const limited = withRateLimit(request);
  if (limited) return limited;
  const parsed = osintSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  if (!env.CENSYS_API_ID || !env.CENSYS_API_SECRET) return NextResponse.json({ ok: false, error: "Censys not configured" }, { status: 503 });

  const gate = ensureVerified(parsed.data.domain);
  if (gate) return gate;

  const auth = Buffer.from(`${env.CENSYS_API_ID}:${env.CENSYS_API_SECRET}`).toString("base64");
  const res = await fetch("https://search.censys.io/api/v2/hosts/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ q: parsed.data.domain, per_page: 5 })
  });
  const data = await res.json();
  writeAudit("osint_censys", parsed.data.domain, { ok: res.ok });
  return NextResponse.json({ ok: res.ok, data: { total: data.result?.total ?? 0, hits: data.result?.hits ?? [] } });
}

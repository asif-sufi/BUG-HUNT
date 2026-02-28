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
  if (!env.SECURITYTRAILS_API_KEY) return NextResponse.json({ ok: false, error: "SecurityTrails not configured" }, { status: 503 });

  const gate = ensureVerified(parsed.data.domain);
  if (gate) return gate;

  const res = await fetch(`https://api.securitytrails.com/v1/domain/${parsed.data.domain}`, {
    headers: { APIKEY: env.SECURITYTRAILS_API_KEY },
    cache: "no-store"
  });
  const data = await res.json();
  writeAudit("osint_securitytrails", parsed.data.domain, { ok: res.ok });
  return NextResponse.json({ ok: res.ok, data: { hostname: data.hostname ?? parsed.data.domain, currentDns: data.current_dns ?? {} } });
}

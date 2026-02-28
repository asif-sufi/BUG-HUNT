import { NextRequest, NextResponse } from "next/server";
import { postureDomainSchema } from "@/lib/schemas";
import { withRateLimit } from "@/lib/http";
import { writeAudit } from "@/lib/audit";

const REQUIRED_HEADERS = ["strict-transport-security", "content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"];

export async function POST(request: NextRequest) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const parse = postureDomainSchema.safeParse(await request.json());
  if (!parse.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const { domain } = parse.data;
  const url = `https://${domain}`;

  let response = await fetch(url, { method: "HEAD", redirect: "follow", cache: "no-store" });
  if (!response.ok) response = await fetch(url, { method: "GET", redirect: "follow", cache: "no-store" });

  const headers = Object.fromEntries(REQUIRED_HEADERS.map((header) => [header, response.headers.get(header)]));
  const missing = REQUIRED_HEADERS.filter((header) => !headers[header]);
  writeAudit("posture_http", domain, { status: response.status, missing: missing.length });

  return NextResponse.json({ ok: true, status: response.status, headers, missing });
}

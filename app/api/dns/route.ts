import { NextRequest, NextResponse } from "next/server";
import { dnsQuerySchema } from "@/lib/schemas";
import { withRateLimit } from "@/lib/http";
import { queryDoh } from "@/lib/doh";
import { writeAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const parse = dnsQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parse.success) return NextResponse.json({ ok: false, error: "Invalid query" }, { status: 400 });

  const data = await queryDoh(parse.data.name, parse.data.type);
  writeAudit("dns_query", parse.data.name, { type: parse.data.type });
  return NextResponse.json({ ok: true, status: data.status, answers: data.answers.map((answer) => ({ data: answer.data, ttl: answer.TTL })) });
}

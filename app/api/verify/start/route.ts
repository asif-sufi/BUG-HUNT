import { NextRequest, NextResponse } from "next/server";
import { verifyStartSchema } from "@/lib/schemas";
import { startVerification } from "@/lib/verify-store";
import { withRateLimit } from "@/lib/http";
import { writeAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const parse = verifyStartSchema.safeParse(await request.json());
  if (!parse.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const { domain } = parse.data;
  const state = startVerification(domain);
  writeAudit("verify_start", domain, { verified: false });

  return NextResponse.json({ ok: true, domain, token: state.token, txtName: `_verify-studio.${domain}` });
}

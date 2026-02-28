import { NextRequest, NextResponse } from "next/server";
import { verifyCheckSchema } from "@/lib/schemas";
import { getVerification, markVerified } from "@/lib/verify-store";
import { withRateLimit } from "@/lib/http";
import { queryDoh } from "@/lib/doh";
import { writeAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const parse = verifyCheckSchema.safeParse(await request.json());
  if (!parse.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const { domain, token } = parse.data;
  const record = getVerification(domain);
  if (!record || record.token !== token) {
    writeAudit("verify_check_failed", domain, { reason: "token_mismatch" });
    return NextResponse.json({ ok: false, verified: false }, { status: 403 });
  }

  const dns = await queryDoh(`_verify-studio.${domain}`, "TXT");
  const verified = dns.answers.some((answer) => answer.data.replaceAll('"', "") === token);

  if (verified) markVerified(domain);
  writeAudit("verify_check", domain, { verified });

  return NextResponse.json({ ok: true, verified });
}

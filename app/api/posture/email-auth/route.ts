import { NextRequest, NextResponse } from "next/server";
import { emailAuthSchema } from "@/lib/schemas";
import { withRateLimit } from "@/lib/http";
import { queryDoh } from "@/lib/doh";
import { writeAudit } from "@/lib/audit";

const recommendation = {
  spf: 'v=spf1 include:_spf.google.com ~all',
  dmarc: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com',
  dkim: 'v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY'
};

export async function POST(request: NextRequest) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const parse = emailAuthSchema.safeParse(await request.json());
  if (!parse.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  const { domain, dkimSelector } = parse.data;
  const [spf, dmarc, dkim] = await Promise.all([
    queryDoh(domain, "TXT"),
    queryDoh(`_dmarc.${domain}`, "TXT"),
    queryDoh(`${dkimSelector}._domainkey.${domain}`, "TXT")
  ]);

  const spfRecord = spf.answers.find((answer) => answer.data.includes("v=spf1"))?.data ?? null;
  const dmarcRecord = dmarc.answers.find((answer) => answer.data.toLowerCase().includes("v=dmarc1"))?.data ?? null;
  const dkimRecord = dkim.answers.find((answer) => answer.data.toLowerCase().includes("v=dkim1"))?.data ?? null;

  writeAudit("posture_email_auth", domain, { hasSpf: Boolean(spfRecord), hasDmarc: Boolean(dmarcRecord), hasDkim: Boolean(dkimRecord) });

  return NextResponse.json({
    ok: true,
    domain,
    evaluation: {
      spf: { status: spfRecord ? "present" : "missing", record: spfRecord },
      dmarc: { status: dmarcRecord ? "present" : "missing", record: dmarcRecord },
      dkim: { status: dkimRecord ? "present" : "missing", record: dkimRecord }
    },
    recommendations: [
      !spfRecord && { type: "SPF", host: domain, value: recommendation.spf },
      !dmarcRecord && { type: "DMARC", host: `_dmarc.${domain}`, value: recommendation.dmarc },
      !dkimRecord && { type: "DKIM", host: `${dkimSelector}._domainkey.${domain}`, value: recommendation.dkim }
    ].filter(Boolean)
  });
}

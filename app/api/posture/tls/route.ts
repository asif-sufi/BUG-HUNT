import tls from "node:tls";
import { NextRequest, NextResponse } from "next/server";
import { postureDomainSchema } from "@/lib/schemas";
import { withRateLimit } from "@/lib/http";
import { writeAudit } from "@/lib/audit";

function getCertificateInfo(domain: string): Promise<{ validTo: string; validFrom: string; subject: string; san: string[]; daysLeft: number }> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: domain, port: 443, servername: domain, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert?.valid_to) return reject(new Error("No certificate"));

      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysLeft = Math.ceil((validTo.getTime() - now.getTime()) / 86_400_000);
      resolve({
        validTo: validTo.toISOString(),
        validFrom: new Date(cert.valid_from).toISOString(),
        subject: cert.subject?.CN ?? "unknown",
        san: (cert.subjectaltname ?? "").split(",").map((part: string) => part.trim()).filter(Boolean),
        daysLeft
      });
    });
    socket.on("error", reject);
  });
}

export async function POST(request: NextRequest) {
  const limited = withRateLimit(request);
  if (limited) return limited;

  const parse = postureDomainSchema.safeParse(await request.json());
  if (!parse.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });

  try {
    const info = await getCertificateInfo(parse.data.domain);
    writeAudit("posture_tls", parse.data.domain, { daysLeft: info.daysLeft });
    return NextResponse.json({ ok: true, ...info });
  } catch {
    writeAudit("posture_tls_failed", parse.data.domain, {});
    return NextResponse.json({ ok: false, error: "Unable to inspect certificate" }, { status: 502 });
  }
}

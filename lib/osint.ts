import { NextResponse } from "next/server";
import { getVerification } from "@/lib/verify-store";

export function ensureVerified(domain: string) {
  const state = getVerification(domain);
  if (!state?.verified) {
    return NextResponse.json({ ok: false, error: "Domain must be verified before this action" }, { status: 403 });
  }
  return null;
}

import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

export const getIp = (request: NextRequest) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

export function withRateLimit(request: NextRequest) {
  const ip = getIp(request);
  const result = enforceRateLimit(ip);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
  }
  return null;
}

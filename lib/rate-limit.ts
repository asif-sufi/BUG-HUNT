import { env } from "@/lib/env";

type RateState = { count: number; resetAt: number };

const store = new Map<string, RateState>();

export function enforceRateLimit(key: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const resetAt = now + 60_000;
  const current = store.get(key);

  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: env.RATE_LIMIT_PER_MINUTE - 1 };
  }

  if (current.count >= env.RATE_LIMIT_PER_MINUTE) {
    return { ok: false, remaining: 0 };
  }

  current.count += 1;
  store.set(key, current);
  return { ok: true, remaining: env.RATE_LIMIT_PER_MINUTE - current.count };
}

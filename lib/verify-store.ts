import crypto from "node:crypto";

interface VerificationState {
  token: string;
  verified: boolean;
  createdAt: string;
}

const state = new Map<string, VerificationState>();

export function startVerification(domain: string) {
  const token = crypto.randomBytes(18).toString("hex");
  const next: VerificationState = {
    token,
    verified: false,
    createdAt: new Date().toISOString()
  };
  state.set(domain, next);
  return next;
}

export const getVerification = (domain: string) => state.get(domain);

export function markVerified(domain: string) {
  const existing = state.get(domain);
  if (!existing) return;
  state.set(domain, { ...existing, verified: true });
}

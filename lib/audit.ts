import crypto from "node:crypto";
import { env } from "@/lib/env";
import type { AuditLog } from "@/types/models";

const logs: AuditLog[] = [];

export const hashDomain = (domain: string) =>
  crypto.createHash("sha256").update(`${domain}:${env.AUDIT_LOG_SALT}`).digest("hex");

export function writeAudit(action: string, domain: string, metadata?: AuditLog["metadata"]) {
  logs.unshift({
    ts: new Date().toISOString(),
    action,
    domainHash: hashDomain(domain),
    metadata
  });

  if (logs.length > 500) logs.pop();
}

export const getAuditLogs = () => logs;

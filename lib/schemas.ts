import { z } from "zod";

export const domainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^([a-z0-9-]+\.)+[a-z]{2,}$/i, "Invalid domain");

export const verifyStartSchema = z.object({ domain: domainSchema });

export const verifyCheckSchema = z.object({
  domain: domainSchema,
  token: z.string().min(10).max(100)
});

export const dnsQuerySchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["A", "AAAA", "CNAME", "NS", "MX", "TXT", "CAA"]).default("A")
});

export const postureDomainSchema = z.object({ domain: domainSchema });

export const emailAuthSchema = z.object({
  domain: domainSchema,
  dkimSelector: z.enum(["default", "google", "selector1"]).default("default")
});

export const osintSchema = z.object({
  domain: domainSchema,
  verified: z.boolean()
});

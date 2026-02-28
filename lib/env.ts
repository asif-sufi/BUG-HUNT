const required = (name: string, fallback?: string) => {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

export const env = {
  APP_URL: required("APP_URL", "http://localhost:3000"),
  NODE_ENV: required("NODE_ENV", "development"),
  DNS_DOH_ENDPOINT: required("DNS_DOH_ENDPOINT", "https://dns.google/resolve"),
  RATE_LIMIT_PER_MINUTE: Number(process.env.RATE_LIMIT_PER_MINUTE ?? "30"),
  AUDIT_LOG_SALT: required("AUDIT_LOG_SALT", "change_me_long_random"),
  SHODAN_API_KEY: process.env.SHODAN_API_KEY ?? "",
  VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY ?? "",
  SECURITYTRAILS_API_KEY: process.env.SECURITYTRAILS_API_KEY ?? "",
  CENSYS_API_ID: process.env.CENSYS_API_ID ?? "",
  CENSYS_API_SECRET: process.env.CENSYS_API_SECRET ?? ""
};

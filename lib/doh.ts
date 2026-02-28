import { env } from "@/lib/env";

interface AnswerRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export async function queryDoh(name: string, type: string) {
  const url = new URL(env.DNS_DOH_ENDPOINT);
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);

  const res = await fetch(url.toString(), {
    headers: { accept: "application/dns-json" },
    cache: "no-store"
  });

  if (!res.ok) return { status: "error", answers: [] as AnswerRecord[] };
  const data = (await res.json()) as { Status?: number; Answer?: AnswerRecord[] };
  return {
    status: data.Status === 0 ? "ok" : "dns_error",
    answers: data.Answer ?? []
  };
}

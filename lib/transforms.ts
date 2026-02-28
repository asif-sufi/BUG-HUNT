export const normalizeHostnames = (items: string[]) =>
  items.map((item) => item.trim().toLowerCase().replace(/\.$/, ""));

export const normalizeUrls = (items: string[]) =>
  items.map((item) => {
    try {
      const url = new URL(item);
      return `${url.protocol}//${url.host}${url.pathname}`.replace(/\/$/, "");
    } catch {
      return item.trim();
    }
  });

export const uniqueByKey = <T extends Record<string, unknown>>(items: T[], key: keyof T) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = String(item[key]);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const excludeRegex = (items: string[], pattern: string) => {
  const regex = new RegExp(pattern);
  return items.filter((item) => !regex.test(item));
};

export const includeRegex = (items: string[], pattern: string) => {
  const regex = new RegExp(pattern);
  return items.filter((item) => regex.test(item));
};

export const onlyHttps = (items: string[]) => items.filter((item) => item.startsWith("https://"));

export const onlyStatus = <T extends { status?: number }>(items: T[], status: number) =>
  items.filter((item) => item.status === status);

export const sortStable = (items: string[]) => [...items].sort((a, b) => a.localeCompare(b));

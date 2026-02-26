const PRIVATE_IPV4_PATTERNS = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
];

function isPrivateIpv4(hostname: string): boolean {
  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(hostname));
}

function isPrivateIpv6(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "::1" ||
    host === "[::1]" ||
    host.endsWith(".local")
  );
}

export function validateWebhookUrl(rawUrl: string): { ok: true } | { ok: false; error: string } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { ok: false, error: "Webhook URL is required" };
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, error: "Invalid webhook URL" };
  }

  if (!["https:", "http:"].includes(url.protocol)) {
    return { ok: false, error: "Webhook URL must start with http:// or https://" };
  }

  if (isBlockedHostname(url.hostname)) {
    return { ok: false, error: "Blocked webhook host" };
  }

  if (isPrivateIpv4(url.hostname) || isPrivateIpv6(url.hostname)) {
    return { ok: false, error: "Private network targets are not allowed" };
  }

  if (url.username || url.password) {
    return { ok: false, error: "Credentials in URL are not allowed" };
  }

  return { ok: true };
}

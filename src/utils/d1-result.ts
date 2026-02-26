export function getD1Changes(result: unknown): number {
  if (!result || typeof result !== "object") return 0;
  const meta = (result as { meta?: { changes?: number } }).meta;
  if (!meta || typeof meta !== "object") return 0;
  const changes = meta.changes;
  return typeof changes === "number" ? changes : 0;
}

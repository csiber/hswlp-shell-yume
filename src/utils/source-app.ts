export function deriveSourceApp(host?: string | null): string | undefined {
  if (!host) return undefined;
  return host.replace(/:\d+$/, '').split('.')[0];
}
export async function getSourceAppFromHeaders(): Promise<string | undefined> {
  const { headers } = await import('next/headers');
  const host = (await headers()).get('host');
  return deriveSourceApp(host);
}

export function formatCredits(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return String(value);
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

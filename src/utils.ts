export function isNumericCol(col: { base_type?: string; effective_type?: string }): boolean {
  const t = (col.base_type ?? col.effective_type ?? "").toLowerCase();
  return /integer|float|decimal|number|percent|currency|biginteger/.test(t);
}

export function largestRemainder(shares: number[], total: number): number[] {
  if (total <= 0 || shares.length === 0) return shares.map(() => 0);

  const raw = shares.map(s => s * total);
  const floors = raw.map(Math.floor);
  const deficit = total - floors.reduce((a, b) => a + b, 0);

  const order = raw
    .map((v, i) => ({ rem: v - floors[i], i, share: shares[i] }))
    .sort((a, b) => b.rem - a.rem || b.share - a.share)
    .map(x => x.i);

  const result = [...floors];
  for (let k = 0; k < deficit; k++) result[order[k]]++;
  return result;
}

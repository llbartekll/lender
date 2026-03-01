/**
 * Parse a decimal string into a bigint token amount.
 * e.g. parseTokenAmount("1.5", 6) → 1500000n (USDC)
 *      parseTokenAmount("0.1", 18) → 100000000000000000n (ETH)
 */
export function parseTokenAmount(input: string, decimals: number): bigint {
  const trimmed = input.trim();
  if (!trimmed || trimmed === '.') return 0n;

  const parts = trimmed.split('.');
  const whole = parts[0] || '0';
  let frac = parts[1] || '';

  // Truncate extra decimal places (don't round)
  if (frac.length > decimals) {
    frac = frac.slice(0, decimals);
  }

  // Pad fractional part to full decimals
  frac = frac.padEnd(decimals, '0');

  return BigInt(whole + frac);
}

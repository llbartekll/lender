export const RAY = 10n ** 27n;
export const WAD = 10n ** 18n;
export const HALF_RAY = RAY / 2n;
export const SECONDS_PER_YEAR = 31536000;

/** Convert a RAY-denominated bigint to a decimal number */
export function rayToNumber(ray: bigint): number {
  return Number(ray) / Number(RAY);
}

/** Convert a WAD-denominated bigint to a decimal number */
export function wadToNumber(wad: bigint): number {
  return Number(wad) / Number(WAD);
}

/**
 * Convert Aave's liquidity/borrow rate (RAY) to APY percentage.
 * APY = ((1 + rate/secondsPerYear)^secondsPerYear - 1) * 100
 * Simplified: APY ≈ (rate / RAY) * 100 for display purposes (APR)
 * For accurate APY we use the compound formula.
 */
export function calculateAPY(rateRay: bigint): number {
  const rate = Number(rateRay) / Number(RAY);
  // Compound interest: (1 + rate/n)^n - 1, where n = seconds per year
  // For Aave, rate is already per-second compounded, so:
  const apy = (1 + rate / SECONDS_PER_YEAR) ** SECONDS_PER_YEAR - 1;
  return apy * 100; // as percentage
}

/** Convert health factor from WAD bigint to number. Max display value: 999 */
export function healthFactorFromBigInt(hf: bigint): number {
  const value = wadToNumber(hf);
  // Aave returns max uint256 when there's no debt
  if (value > 1e10) return Infinity;
  return value;
}

/** Convert a token amount from its smallest unit to a human-readable number */
export function tokenAmountToNumber(amount: bigint, decimals: number): number {
  return Number(amount) / 10 ** decimals;
}

/**
 * Calculate the actual balance from scaled balance and index.
 * actualBalance = scaledBalance * index / RAY
 */
export function getActualBalance(scaledBalance: bigint, index: bigint): bigint {
  return (scaledBalance * index + HALF_RAY) / RAY;
}

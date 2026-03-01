export function formatUsd(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  if (value > 0) {
    return `$${value.toFixed(4)}`;
  }
  return '$0.00';
}

export function formatPercent(value: number): string {
  if (value < 0.01 && value > 0) {
    return '<0.01%';
  }
  return `${value.toFixed(2)}%`;
}

export function formatTokenAmount(value: number, maxDecimals: number = 4): string {
  if (value === 0) return '0';
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  if (value >= 1) {
    return value.toFixed(Math.min(maxDecimals, 2));
  }
  return value.toFixed(maxDecimals);
}

export function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatHealthFactor(hf: number): string {
  if (hf === Infinity || hf > 100) return '∞';
  if (hf < 0) return '—';
  return hf.toFixed(2);
}

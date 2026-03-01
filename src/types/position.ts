import { type Address } from 'viem';

export interface UserPosition {
  underlyingAsset: Address;
  symbol: string;
  name: string;
  decimals: number;
  priceUsd: number;
  // Supply position
  supplyBalance: bigint;
  supplyBalanceUsd: number;
  supplyAPY: number;
  usageAsCollateralEnabled: boolean;
  // Borrow position
  variableBorrowBalance: bigint;
  variableBorrowBalanceUsd: number;
  variableBorrowAPY: number;
  // Risk params
  baseLTVasCollateral: number;
  reserveLiquidationThreshold: number;
  reserveLiquidationBonus: number;
  liquidationPrice: number | null;
}

export interface AccountSummary {
  totalCollateralUsd: number;
  totalDebtUsd: number;
  availableBorrowsUsd: number;
  currentLiquidationThreshold: number;
  ltv: number;
  healthFactor: number;
  netWorthUsd: number;
}

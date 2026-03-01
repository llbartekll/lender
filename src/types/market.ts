import { type Address } from 'viem';

export interface ReserveData {
  underlyingAsset: Address;
  name: string;
  symbol: string;
  decimals: number;
  supplyAPY: number;
  variableBorrowAPY: number;
  totalSupplied: bigint;
  totalSuppliedUsd: number;
  totalBorrowed: bigint;
  totalBorrowedUsd: number;
  availableLiquidity: bigint;
  availableLiquidityUsd: number;
  priceUsd: number;
  baseLTVasCollateral: number;
  reserveLiquidationThreshold: number;
  reserveLiquidationBonus: number;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
  isPaused: boolean;
  supplyCap: bigint;
  borrowCap: bigint;
  aTokenAddress: Address;
  variableDebtTokenAddress: Address;
  // Raw values for calculations
  liquidityIndex: bigint;
  variableBorrowIndex: bigint;
  liquidityRate: bigint;
  variableBorrowRate: bigint;
}

export interface BaseCurrencyInfo {
  marketReferenceCurrencyUnit: bigint;
  marketReferenceCurrencyPriceInUsd: number;
  networkBaseTokenPriceInUsd: number;
  networkBaseTokenPriceDecimals: number;
}

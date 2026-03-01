import { type Address } from 'viem';
import { type ReserveData, type BaseCurrencyInfo } from '../../types/market';
import { type UserPosition, type AccountSummary } from '../../types/position';
import {
  calculateAPY,
  getActualBalance,
  healthFactorFromBigInt,
  tokenAmountToNumber,
} from './aave-math';

// Base currency unit for Aave V3 on mainnet is in 8 decimals (USD)
const BASE_CURRENCY_DECIMALS = 8;

/** Common fields used by transform — works with both V3.0 and V3.1 struct shapes */
interface RawReserve {
  underlyingAsset: Address;
  name: string;
  symbol: string;
  decimals: bigint;
  baseLTVasCollateral: bigint;
  reserveLiquidationThreshold: bigint;
  reserveLiquidationBonus: bigint;
  reserveFactor: bigint;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
  liquidityIndex: bigint;
  variableBorrowIndex: bigint;
  liquidityRate: bigint;
  variableBorrowRate: bigint;
  lastUpdateTimestamp: bigint;
  aTokenAddress: Address;
  variableDebtTokenAddress: Address;
  interestRateStrategyAddress: Address;
  availableLiquidity: bigint;
  totalScaledVariableDebt: bigint;
  priceInMarketReferenceCurrency: bigint;
  isPaused: boolean;
  accruedToTreasury: bigint;
  isolationModeTotalDebt: bigint;
  debtCeiling: bigint;
  debtCeilingDecimals: bigint;
  borrowCap: bigint;
  supplyCap: bigint;
  borrowableInIsolation: boolean;
  // V3.0 fields
  stableBorrowRateEnabled?: boolean;
  stableDebtTokenAddress?: Address;
  // V3.1 fields
  priceOracle?: Address;
  isSiloedBorrowing?: boolean;
  flashLoanEnabled?: boolean;
  virtualUnderlyingBalance?: bigint;
  deficit?: bigint;
}

interface RawBaseCurrencyInfo {
  marketReferenceCurrencyUnit: bigint;
  marketReferenceCurrencyPriceInUsd: bigint;
  networkBaseTokenPriceInUsd: bigint;
  networkBaseTokenPriceDecimals: number;
}

export function transformReserveData(
  rawReserves: readonly RawReserve[],
  rawBaseCurrencyInfo: RawBaseCurrencyInfo,
): { reserves: ReserveData[]; baseCurrencyInfo: BaseCurrencyInfo } {
  const marketRefUnitInUsd =
    Number(rawBaseCurrencyInfo.marketReferenceCurrencyPriceInUsd) /
    10 ** BASE_CURRENCY_DECIMALS;

  const baseCurrencyInfo: BaseCurrencyInfo = {
    marketReferenceCurrencyUnit: rawBaseCurrencyInfo.marketReferenceCurrencyUnit,
    marketReferenceCurrencyPriceInUsd: marketRefUnitInUsd,
    networkBaseTokenPriceInUsd:
      Number(rawBaseCurrencyInfo.networkBaseTokenPriceInUsd) /
      10 ** BASE_CURRENCY_DECIMALS,
    networkBaseTokenPriceDecimals: rawBaseCurrencyInfo.networkBaseTokenPriceDecimals,
  };

  const marketRefUnit = Number(rawBaseCurrencyInfo.marketReferenceCurrencyUnit);

  const reserves: ReserveData[] = rawReserves
    .filter((r) => r.isActive)
    .map((r) => {
      const decimals = Number(r.decimals);
      const priceInMarketRef = Number(r.priceInMarketReferenceCurrency) / marketRefUnit;
      const priceUsd = priceInMarketRef * marketRefUnitInUsd;

      const totalVariableDebt = getActualBalance(
        r.totalScaledVariableDebt,
        r.variableBorrowIndex,
      );
      const totalSupplied = r.availableLiquidity + totalVariableDebt;

      return {
        underlyingAsset: r.underlyingAsset,
        name: r.name,
        symbol: r.symbol,
        decimals,
        supplyAPY: calculateAPY(r.liquidityRate),
        variableBorrowAPY: calculateAPY(r.variableBorrowRate),
        totalSupplied,
        totalSuppliedUsd: tokenAmountToNumber(totalSupplied, decimals) * priceUsd,
        totalBorrowed: totalVariableDebt,
        totalBorrowedUsd: tokenAmountToNumber(totalVariableDebt, decimals) * priceUsd,
        availableLiquidity: r.availableLiquidity,
        availableLiquidityUsd:
          tokenAmountToNumber(r.availableLiquidity, decimals) * priceUsd,
        priceUsd,
        baseLTVasCollateral: Number(r.baseLTVasCollateral) / 100,
        reserveLiquidationThreshold: Number(r.reserveLiquidationThreshold) / 100,
        reserveLiquidationBonus: Number(r.reserveLiquidationBonus) / 100 - 100,
        usageAsCollateralEnabled: r.usageAsCollateralEnabled,
        borrowingEnabled: r.borrowingEnabled,
        isActive: r.isActive,
        isFrozen: r.isFrozen,
        isPaused: r.isPaused,
        supplyCap: r.supplyCap,
        borrowCap: r.borrowCap,
        aTokenAddress: r.aTokenAddress,
        variableDebtTokenAddress: r.variableDebtTokenAddress,
        liquidityIndex: r.liquidityIndex,
        variableBorrowIndex: r.variableBorrowIndex,
        liquidityRate: r.liquidityRate,
        variableBorrowRate: r.variableBorrowRate,
      };
    });

  return { reserves, baseCurrencyInfo };
}

interface RawUserReserve {
  underlyingAsset: Address;
  scaledATokenBalance: bigint;
  usageAsCollateralEnabledOnUser: boolean;
  scaledVariableDebt: bigint;
}

export function transformUserPositions(
  rawUserReserves: readonly RawUserReserve[],
  reserves: ReserveData[],
): UserPosition[] {
  console.log('[transformUserPositions] rawUserReserves:', rawUserReserves.length, 'reserves:', reserves.length);
  const reserveMap = new Map(reserves.map((r) => [r.underlyingAsset.toLowerCase(), r]));

  const positions: UserPosition[] = [];

  for (const ur of rawUserReserves) {
    const reserve = reserveMap.get(ur.underlyingAsset.toLowerCase());
    if (!reserve) {
      console.log('[transformUserPositions] no reserve found for', ur.underlyingAsset);
      continue;
    }

    const supplyBalance = getActualBalance(
      ur.scaledATokenBalance,
      reserve.liquidityIndex,
    );
    const variableBorrowBalance = getActualBalance(
      ur.scaledVariableDebt,
      reserve.variableBorrowIndex,
    );

    const supplyBalanceNum = tokenAmountToNumber(supplyBalance, reserve.decimals);
    const variableBorrowNum = tokenAmountToNumber(variableBorrowBalance, reserve.decimals);

    if (supplyBalanceNum < 0.000001 && variableBorrowNum < 0.000001) {
      continue;
    }

    console.log('[transformUserPositions] ✓', reserve.symbol, 'supply:', supplyBalanceNum, 'borrow:', variableBorrowNum);

    positions.push({
      underlyingAsset: reserve.underlyingAsset,
      symbol: reserve.symbol,
      name: reserve.name,
      decimals: reserve.decimals,
      priceUsd: reserve.priceUsd,
      supplyBalance,
      supplyBalanceUsd: supplyBalanceNum * reserve.priceUsd,
      supplyAPY: reserve.supplyAPY,
      usageAsCollateralEnabled: ur.usageAsCollateralEnabledOnUser,
      variableBorrowBalance,
      variableBorrowBalanceUsd: variableBorrowNum * reserve.priceUsd,
      variableBorrowAPY: reserve.variableBorrowAPY,
      baseLTVasCollateral: reserve.baseLTVasCollateral,
      reserveLiquidationThreshold: reserve.reserveLiquidationThreshold,
      reserveLiquidationBonus: reserve.reserveLiquidationBonus,
      liquidationPrice: null,
    });
  }

  return positions;
}

interface RawAccountData {
  totalCollateralBase: bigint;
  totalDebtBase: bigint;
  availableBorrowsBase: bigint;
  currentLiquidationThreshold: bigint;
  ltv: bigint;
  healthFactor: bigint;
}

export function transformAccountSummary(
  raw: RawAccountData,
  baseCurrencyPriceInUsd: number,
): AccountSummary {
  const totalCollateralUsd =
    (Number(raw.totalCollateralBase) / 10 ** BASE_CURRENCY_DECIMALS) * baseCurrencyPriceInUsd;
  const totalDebtUsd =
    (Number(raw.totalDebtBase) / 10 ** BASE_CURRENCY_DECIMALS) * baseCurrencyPriceInUsd;
  const availableBorrowsUsd =
    (Number(raw.availableBorrowsBase) / 10 ** BASE_CURRENCY_DECIMALS) * baseCurrencyPriceInUsd;

  return {
    totalCollateralUsd,
    totalDebtUsd,
    availableBorrowsUsd,
    currentLiquidationThreshold: Number(raw.currentLiquidationThreshold) / 100,
    ltv: Number(raw.ltv) / 100,
    healthFactor: healthFactorFromBigInt(raw.healthFactor),
    netWorthUsd: totalCollateralUsd - totalDebtUsd,
  };
}

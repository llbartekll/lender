/**
 * V3.0 ABI — used by Optimism, Arbitrum, etc. (aave-v3-periphery master)
 * 51 fields including stable borrow, eMode, and rate strategy fields.
 */
const reserveDataV3_0 = [
  { name: 'underlyingAsset', type: 'address' },
  { name: 'name', type: 'string' },
  { name: 'symbol', type: 'string' },
  { name: 'decimals', type: 'uint256' },
  { name: 'baseLTVasCollateral', type: 'uint256' },
  { name: 'reserveLiquidationThreshold', type: 'uint256' },
  { name: 'reserveLiquidationBonus', type: 'uint256' },
  { name: 'reserveFactor', type: 'uint256' },
  { name: 'usageAsCollateralEnabled', type: 'bool' },
  { name: 'borrowingEnabled', type: 'bool' },
  { name: 'stableBorrowRateEnabled', type: 'bool' },
  { name: 'isActive', type: 'bool' },
  { name: 'isFrozen', type: 'bool' },
  { name: 'liquidityIndex', type: 'uint128' },
  { name: 'variableBorrowIndex', type: 'uint128' },
  { name: 'liquidityRate', type: 'uint128' },
  { name: 'variableBorrowRate', type: 'uint128' },
  { name: 'stableBorrowRate', type: 'uint128' },
  { name: 'lastUpdateTimestamp', type: 'uint40' },
  { name: 'aTokenAddress', type: 'address' },
  { name: 'stableDebtTokenAddress', type: 'address' },
  { name: 'variableDebtTokenAddress', type: 'address' },
  { name: 'interestRateStrategyAddress', type: 'address' },
  { name: 'availableLiquidity', type: 'uint256' },
  { name: 'totalPrincipalStableDebt', type: 'uint256' },
  { name: 'averageStableRate', type: 'uint256' },
  { name: 'stableDebtLastUpdateTimestamp', type: 'uint256' },
  { name: 'totalScaledVariableDebt', type: 'uint256' },
  { name: 'priceInMarketReferenceCurrency', type: 'uint256' },
  { name: 'priceOracle', type: 'address' },
  { name: 'variableRateSlope1', type: 'uint256' },
  { name: 'variableRateSlope2', type: 'uint256' },
  { name: 'stableRateSlope1', type: 'uint256' },
  { name: 'stableRateSlope2', type: 'uint256' },
  { name: 'baseStableBorrowRate', type: 'uint256' },
  { name: 'baseVariableBorrowRate', type: 'uint256' },
  { name: 'optimalUsageRatio', type: 'uint256' },
  { name: 'isPaused', type: 'bool' },
  { name: 'isSiloedBorrowing', type: 'bool' },
  { name: 'accruedToTreasury', type: 'uint128' },
  { name: 'unbacked', type: 'uint128' },
  { name: 'isolationModeTotalDebt', type: 'uint128' },
  { name: 'flashLoanEnabled', type: 'bool' },
  { name: 'debtCeiling', type: 'uint256' },
  { name: 'debtCeilingDecimals', type: 'uint256' },
  { name: 'eModeCategoryId', type: 'uint8' },
  { name: 'borrowCap', type: 'uint256' },
  { name: 'supplyCap', type: 'uint256' },
  { name: 'eModeLtv', type: 'uint16' },
  { name: 'eModeLiquidationThreshold', type: 'uint16' },
  { name: 'eModeLiquidationBonus', type: 'uint16' },
  { name: 'eModePriceSource', type: 'address' },
  { name: 'eModeLabel', type: 'string' },
  { name: 'borrowableInIsolation', type: 'bool' },
] as const;

/**
 * V3.1 ABI — used by Ethereum mainnet (aave-v3-origin deployment)
 * No stable borrow or eMode fields; adds virtualUnderlyingBalance, deficit, etc.
 */
const reserveDataV3_1 = [
  { name: 'underlyingAsset', type: 'address' },
  { name: 'name', type: 'string' },
  { name: 'symbol', type: 'string' },
  { name: 'decimals', type: 'uint256' },
  { name: 'baseLTVasCollateral', type: 'uint256' },
  { name: 'reserveLiquidationThreshold', type: 'uint256' },
  { name: 'reserveLiquidationBonus', type: 'uint256' },
  { name: 'reserveFactor', type: 'uint256' },
  { name: 'usageAsCollateralEnabled', type: 'bool' },
  { name: 'borrowingEnabled', type: 'bool' },
  { name: 'isActive', type: 'bool' },
  { name: 'isFrozen', type: 'bool' },
  { name: 'liquidityIndex', type: 'uint128' },
  { name: 'variableBorrowIndex', type: 'uint128' },
  { name: 'liquidityRate', type: 'uint128' },
  { name: 'variableBorrowRate', type: 'uint128' },
  { name: 'lastUpdateTimestamp', type: 'uint40' },
  { name: 'aTokenAddress', type: 'address' },
  { name: 'variableDebtTokenAddress', type: 'address' },
  { name: 'interestRateStrategyAddress', type: 'address' },
  { name: 'availableLiquidity', type: 'uint256' },
  { name: 'totalScaledVariableDebt', type: 'uint256' },
  { name: 'priceInMarketReferenceCurrency', type: 'uint256' },
  { name: 'priceOracle', type: 'address' },
  { name: 'variableRateSlope1', type: 'uint256' },
  { name: 'variableRateSlope2', type: 'uint256' },
  { name: 'baseVariableBorrowRate', type: 'uint256' },
  { name: 'optimalUsageRatio', type: 'uint256' },
  { name: 'isPaused', type: 'bool' },
  { name: 'isSiloedBorrowing', type: 'bool' },
  { name: 'accruedToTreasury', type: 'uint128' },
  { name: 'isolationModeTotalDebt', type: 'uint128' },
  { name: 'flashLoanEnabled', type: 'bool' },
  { name: 'debtCeiling', type: 'uint256' },
  { name: 'debtCeilingDecimals', type: 'uint256' },
  { name: 'borrowCap', type: 'uint256' },
  { name: 'supplyCap', type: 'uint256' },
  { name: 'borrowableInIsolation', type: 'bool' },
  { name: 'virtualUnderlyingBalance', type: 'uint128' },
  { name: 'deficit', type: 'uint128' },
] as const;

const baseCurrencyInfoComponents = [
  { name: 'marketReferenceCurrencyUnit', type: 'uint256' },
  { name: 'marketReferenceCurrencyPriceInUsd', type: 'int256' },
  { name: 'networkBaseTokenPriceInUsd', type: 'int256' },
  { name: 'networkBaseTokenPriceDecimals', type: 'uint8' },
] as const;

/** V3.0 UserReserveData — includes stable borrow fields (7 fields) */
const userReserveComponentsV3_0 = [
  { name: 'underlyingAsset', type: 'address' },
  { name: 'scaledATokenBalance', type: 'uint256' },
  { name: 'usageAsCollateralEnabledOnUser', type: 'bool' },
  { name: 'stableBorrowRate', type: 'uint256' },
  { name: 'scaledVariableDebt', type: 'uint256' },
  { name: 'principalStableDebt', type: 'uint256' },
  { name: 'stableBorrowLastUpdateTimestamp', type: 'uint256' },
] as const;

/** V3.1 UserReserveData — no stable borrow fields (4 fields) */
const userReserveComponentsV3_1 = [
  { name: 'underlyingAsset', type: 'address' },
  { name: 'scaledATokenBalance', type: 'uint256' },
  { name: 'usageAsCollateralEnabledOnUser', type: 'bool' },
  { name: 'scaledVariableDebt', type: 'uint256' },
] as const;

function buildAbi(
  reserveComponents: readonly Record<string, unknown>[],
  userReserveComponents: readonly Record<string, unknown>[],
) {
  return [
    {
      inputs: [{ name: 'provider', type: 'address' }],
      name: 'getReservesData',
      outputs: [
        { components: reserveComponents, name: '', type: 'tuple[]' },
        { components: baseCurrencyInfoComponents, name: '', type: 'tuple' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'provider', type: 'address' },
        { name: 'user', type: 'address' },
      ],
      name: 'getUserReservesData',
      outputs: [
        { components: userReserveComponents, name: '', type: 'tuple[]' },
        { name: '', type: 'uint8' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const;
}

/** V3.0 ABI for Optimism and other original periphery deployments */
export const uiPoolDataProviderV3_0Abi = buildAbi(reserveDataV3_0, userReserveComponentsV3_0);

/** V3.1 ABI for Ethereum mainnet (aave-v3-origin) */
export const uiPoolDataProviderV3_1Abi = buildAbi(reserveDataV3_1, userReserveComponentsV3_1);

/** Chain → ABI version mapping */
const CHAIN_ABI_VERSION: Record<number, 'v3.0' | 'v3.1'> = {
  1: 'v3.1',
  10: 'v3.0',
};

export function getUiPoolDataProviderAbi(chainId: number) {
  const version = CHAIN_ABI_VERSION[chainId] ?? 'v3.0';
  return version === 'v3.1' ? uiPoolDataProviderV3_1Abi : uiPoolDataProviderV3_0Abi;
}

import { type Address, type PublicClient } from 'viem';
import { getUiPoolDataProviderAbi } from './abis/ui-pool-data-provider';
import { poolAbi } from './abis/pool';
import { aaveOracleAbi } from './abis/aave-oracle';
import { getAddresses } from './addresses';

export async function fetchReservesData(client: PublicClient, chainId: number = 1) {
  const addresses = getAddresses(chainId);
  console.log('[fetchReservesData] calling UiPoolDataProvider at', addresses.uiPoolDataProvider);
  try {
    const result = await client.readContract({
      address: addresses.uiPoolDataProvider,
      abi: getUiPoolDataProviderAbi(chainId),
      functionName: 'getReservesData',
      args: [addresses.poolAddressesProvider],
    });
    console.log('[fetchReservesData] success, got', result[0].length, 'reserves');
    return { reserves: result[0], baseCurrencyInfo: result[1] };
  } catch (error) {
    const err = error as any;
    console.error('[fetchReservesData] RPC call failed:', err.shortMessage ?? err.message);
    if (err.cause) console.error('[fetchReservesData] cause:', err.cause.message ?? err.cause);
    throw error;
  }
}

export async function fetchUserReservesData(
  client: PublicClient,
  user: Address,
  chainId: number = 1,
) {
  const addresses = getAddresses(chainId);
  console.log('[fetchUserReservesData] user:', user, 'provider:', addresses.poolAddressesProvider);
  try {
    const result = await client.readContract({
      address: addresses.uiPoolDataProvider,
      abi: getUiPoolDataProviderAbi(chainId),
      functionName: 'getUserReservesData',
      args: [addresses.poolAddressesProvider, user],
    });
    console.log('[fetchUserReservesData] got', result[0].length, 'user reserves');
    const nonZero = result[0].filter(
      (r) => r.scaledATokenBalance > 0n || r.scaledVariableDebt > 0n,
    );
    console.log('[fetchUserReservesData] non-zero reserves:', nonZero.length);
    for (const r of nonZero) {
      console.log('[fetchUserReservesData]  asset:', r.underlyingAsset, 'aToken:', r.scaledATokenBalance.toString(), 'debt:', r.scaledVariableDebt.toString());
    }
    return { userReserves: result[0], userEmodeCategoryId: result[1] };
  } catch (error) {
    const err = error as any;
    console.error('[fetchUserReservesData] failed:', err.shortMessage ?? err.message);
    throw error;
  }
}

export async function fetchUserAccountData(
  client: PublicClient,
  user: Address,
  chainId: number = 1,
) {
  const addresses = getAddresses(chainId);
  console.log('[fetchUserAccountData] user:', user);
  try {
    const result = await client.readContract({
      address: addresses.pool,
      abi: poolAbi,
      functionName: 'getUserAccountData',
      args: [user],
    });
    console.log('[fetchUserAccountData] collateral:', result[0].toString(), 'debt:', result[1].toString(), 'healthFactor:', result[5].toString());
    return {
      totalCollateralBase: result[0],
      totalDebtBase: result[1],
      availableBorrowsBase: result[2],
      currentLiquidationThreshold: result[3],
      ltv: result[4],
      healthFactor: result[5],
    };
  } catch (error) {
    const err = error as any;
    console.error('[fetchUserAccountData] failed:', err.shortMessage ?? err.message);
    throw error;
  }
}

export async function fetchAssetPrices(
  client: PublicClient,
  assets: Address[],
  chainId: number = 1,
) {
  const addresses = getAddresses(chainId);
  return client.readContract({
    address: addresses.aaveOracle,
    abi: aaveOracleAbi,
    functionName: 'getAssetsPrices',
    args: [assets],
  });
}

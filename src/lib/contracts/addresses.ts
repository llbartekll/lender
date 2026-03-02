import { type Address } from 'viem';

export interface AaveV3Addresses {
  poolAddressesProvider: Address;
  pool: Address;
  aaveOracle: Address;
  uiPoolDataProvider: Address;
}

export const AAVE_V3_ADDRESSES: Record<number, AaveV3Addresses> = {
  1: {
    poolAddressesProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    aaveOracle: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
    uiPoolDataProvider: '0x56b7A1012765C285afAC8b8F25C69Bf10ccfE978',
  },
  10: {
    poolAddressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
    pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    aaveOracle: '0xD81eb3728a631871a7eBBaD631b5f424909f0c77',
    uiPoolDataProvider: '0xbd83DdBE37fc91923d59C8c1E0bDe0CccCa332d5',
  },
};

export function getAddresses(chainId: number = 1): AaveV3Addresses {
  const addresses = AAVE_V3_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`Aave V3 addresses not configured for chain ${chainId}`);
  }
  return addresses;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const LEVERAGE_MANAGER_ADDRESSES: Record<number, Address> = {
  10: (process.env.EXPO_PUBLIC_LEVERAGE_MANAGER_ADDRESS_OP as Address | undefined) ?? ZERO_ADDRESS,
};

export function getLeverageManagerAddress(chainId: number = 10): Address {
  const address = LEVERAGE_MANAGER_ADDRESSES[chainId];
  if (!address || address === ZERO_ADDRESS) {
    throw new Error(
      `LeverageManager address not configured for chain ${chainId}. Set EXPO_PUBLIC_LEVERAGE_MANAGER_ADDRESS_OP in your .env`,
    );
  }
  return address;
}

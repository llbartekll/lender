# Add Contract Integration

Scaffold a new contract integration: ABI + read function + React Query hook.

## Gather Info

Ask the user for:
1. **Contract name** (e.g., "AaveOracle", "StakedAave") — used for file naming
2. **Contract address** on Ethereum mainnet
3. **Function signatures** to call (e.g., `getAssetPrice(address asset) returns (uint256)`)

## Steps

### 1. Create ABI file

Create `src/lib/contracts/abis/<kebab-case-name>.ts`:
- Export a partial ABI as `const <camelCaseName>Abi = [...] as const`
- Include only the function signatures the user specified
- Follow the pattern in existing ABI files (e.g., `src/lib/contracts/abis/aave-oracle.ts`)

### 2. Export from ABI index

Add the new ABI export to `src/lib/contracts/abis/index.ts`.

### 3. Add address (if needed)

If the contract address isn't already in `src/lib/contracts/addresses.ts`, add it to the `AAVE_V3_ADDRESSES` map under chainId `1`.

### 4. Add read function

Add a new async function to `src/lib/contracts/reads.ts`:
- Accept `client: PublicClient` and `chainId: number = 1` as params
- Use `client.readContract(...)` with the new ABI
- Return raw data (no transformation here)
- Follow the pattern of existing functions like `fetchReservesData`

### 5. Create React Query hook

Create `src/hooks/queries/use-<kebab-case-name>.ts`:
- Import the read function from `../../lib/contracts/reads`
- Import `publicClient` from `../../lib/viem/client`
- Use `useQuery` with an appropriate query key and stale time
- Use relative imports (not @src/ alias)
- Follow the pattern in `src/hooks/queries/use-reserves.ts`

## Checklist
- [ ] ABI file created with `as const`
- [ ] ABI re-exported from index
- [ ] Address added if new
- [ ] Read function in reads.ts
- [ ] React Query hook created
- [ ] Type check passes: `npx tsc --noEmit`

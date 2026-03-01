# DeFi Lender

## Quick Reference
- Run: `npx expo start`, press `i` for iOS sim, `R` to reload
- Build iOS: `npx expo run:ios`
- Type check: `npx tsc --noEmit`
- Polyfills: `polyfills.ts` MUST be imported first in `app/_layout.tsx`

## Architecture
- `src/lib/` — zero React deps. Pure functions only.
- `src/hooks/queries/` — thin React Query wrappers over `src/lib/`
- `src/components/` — feature folders: ui/, common/, dashboard/, markets/, settings/
- `src/store/` — Zustand stores with AsyncStorage persist
- `app/` — Expo Router file-based routes. Thin wrappers that import screen components.

## Conventions
- All token amounts: `bigint` until display layer (use `src/lib/utils/format.ts`)
- Styling: `StyleSheet.create` only — no NativeWind, no inline styles
- Components: PascalCase files. Hooks/utils/stores: kebab-case files.
- Imports: relative paths within `src/` (the @src/* alias exists but we use relative)
- ABIs: partial `as const` in `src/lib/contracts/abis/` — only functions we call
- Dark theme only. Colors in `src/theme/colors.ts`
- Contract addresses: chain-indexed map in `src/lib/contracts/addresses.ts`

## Adding Things
- **New screen**: create route in `app/`, create screen component in `src/components/<feature>/`
- **New contract read**: add ABI to `abis/`, add read function to `reads.ts`, add hook in `hooks/queries/`
- **New chain**: add entry to `AAVE_V3_ADDRESSES` in `addresses.ts`
- **New write transaction**: add ABI entry to `abis/`, add function to `writes.ts`, use `useTransaction` hook to orchestrate (approve → execute → wait → invalidate)

## Key Files
- RPC config: `src/lib/viem/client.ts`
- Contract addresses: `src/lib/contracts/addresses.ts`
- Data transform pipeline: `reads.ts` → `transform.ts` → hook → component
- Mock data toggle: `USE_MOCKS` in `src/lib/mocks/reserves.ts`
- Wallet client: `src/lib/viem/wallet-client.ts` (creates signing client from private key)
- Write transactions: `src/lib/contracts/writes.ts` (approve, supply, repay)
- Transaction flow: `writes.ts` → `use-transaction.ts` hook → `TransactionModal.tsx`

# Lender Codex Setup

## Project Defaults
- Run: `npx expo start` (press `i` for iOS simulator, `R` to reload)
- Build iOS: `npx expo run:ios`
- Type check: `npx tsc --noEmit`
- `polyfills.ts` MUST be imported first in `app/_layout.tsx`

## Architecture
- `src/lib/` — zero React dependencies; pure functions only
- `src/hooks/queries/` — thin React Query wrappers over `src/lib/`
- `src/components/` — feature folders: `ui/`, `common/`, `dashboard/`, `markets/`, `settings/`
- `src/store/` — Zustand stores with AsyncStorage persist
- `app/` — Expo Router file-based routes; keep route files thin

## Conventions
- Token amounts remain `bigint` until display layer (use `src/lib/utils/format.ts`)
- Styling uses `StyleSheet.create` only (no NativeWind, no inline styles)
- Components use PascalCase files; hooks/utils/stores use kebab-case files
- Use relative imports inside `src/` (do not prefer alias imports)
- ABIs are partial `as const` files in `src/lib/contracts/abis/` (only called functions)
- Dark theme only; colors come from `src/theme/colors.ts`
- Contract addresses are chain-indexed in `src/lib/contracts/addresses.ts`

## RPC Policy
- Default RPC transport uses WalletConnect RPC with `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID`.
- Endpoint format:
  - `https://rpc.walletconnect.com/v1/?chainId=eip155:<CHAIN_ID>&projectId=<PROJECT_ID>`
- Keep chain set to Optimism (`10`) unless the task explicitly requires another network.
- Use `rpcUrl` override from Settings only for local development (for example Anvil):
  - iOS simulator: `http://127.0.0.1:8545`
  - Android emulator: `http://10.0.2.2:8545`

## Skills
A skill is a local instruction set in a `SKILL.md` file.

### Available skills
- `add-screen`: Scaffold a new Expo Router screen and component with project conventions. (file: `/Users/bartoszrozwarski/Documents/Developer/lender/.codex/skills/add-screen/SKILL.md`)
- `add-contract`: Scaffold a contract integration (ABI + read + query hook) with project conventions. (file: `/Users/bartoszrozwarski/Documents/Developer/lender/.codex/skills/add-contract/SKILL.md`)

## Skill Trigger Rules
- If the user asks to add/create/scaffold a screen, route, modal, tab, or nested route, use `add-screen`.
- If the user asks to add/create/scaffold a contract integration, ABI, read function, or query hook, use `add-contract`.
- If multiple skills apply, use the minimum set that fully covers the request.
- If a skill file cannot be read, continue with best-effort fallback and state the limitation briefly.

## Adding Things
- New screen: create route in `app/`, create screen component in `src/components/<feature>/`
- New contract read: add ABI in `abis/`, add read function in `reads.ts`, add hook in `hooks/queries/`
- New chain: add entry to `AAVE_V3_ADDRESSES` in `addresses.ts`
- New write transaction: add ABI entry, add function to `writes.ts`, orchestrate with `useTransaction`

## Key Files
- RPC config: `src/lib/viem/client.ts`
- Contract addresses: `src/lib/contracts/addresses.ts`
- Data pipeline: `reads.ts` -> `transform.ts` -> hook -> component
- Mock toggle: `USE_MOCKS` in `src/lib/mocks/reserves.ts`
- Wallet client: `src/lib/viem/wallet-client.ts`
- Write transactions: `src/lib/contracts/writes.ts`
- Transaction flow: `writes.ts` -> `use-transaction.ts` -> `TransactionModal.tsx`

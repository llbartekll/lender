---
name: add-contract
description: Scaffold a contract integration by adding ABI, contract read function, and React Query hook.
---

# Add Contract Integration

Use this skill when the user asks to add or scaffold a new contract integration, contract ABI, read function, or query hook.

## Gather
Collect:
1. Contract name
2. Mainnet contract address
3. Function signatures to call

## Workflow
1. Create ABI file `src/lib/contracts/abis/<kebab-case-name>.ts`.
- Export partial ABI only for requested functions.
- Export as `as const`.

2. Re-export ABI in `src/lib/contracts/abis/index.ts`.

3. Add address in `src/lib/contracts/addresses.ts` if missing.
- Add under chainId `1` in `AAVE_V3_ADDRESSES`.

4. Add read function in `src/lib/contracts/reads.ts`.
- Signature should accept `client: PublicClient` and `chainId: number = 1`.
- Use `client.readContract(...)`.
- Return raw data.

5. Add hook `src/hooks/queries/use-<kebab-case-name>.ts`.
- Use `useQuery`.
- Use `publicClient` from `src/lib/viem/client`.
- Use relative imports.

6. Run type check: `npx tsc --noEmit`.

## Checklist
- [ ] ABI created with `as const`
- [ ] ABI re-exported from index
- [ ] Address added if needed
- [ ] Read function added to `reads.ts`
- [ ] Query hook created
- [ ] Type check passes

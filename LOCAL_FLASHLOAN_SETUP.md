# Local Flashloan Setup (Anvil-first)

## Quick Start

Run the automated setup script from the lender repo root:

```bash
bash scripts/local-dev.sh
```

This will:
1. Validate prerequisites (anvil, forge, curl, `../flash-loan-sol`)
2. Kill any existing Anvil on port 8545
3. Start Anvil forking Optimism via WalletConnect RPC
4. Deploy LeverageManager using Anvil's default account #0
5. Update `.env` with the deployed address
6. Keep Anvil running in foreground (Ctrl+C to stop)

After the script prints the summary, open the app:
- Settings → Custom RPC → `http://127.0.0.1:8545`
- Reload Expo (`R`)

## Preconditions
- Anvil + Forge installed ([Foundry](https://getfoundry.sh))
- `../flash-loan-sol` repo cloned alongside this repo
- App wallet imported with a funded private key
- Wallet has collateral supplied in Aave before trying leverage/deleverage

## Fork RPC

The script picks the fork RPC in this order:
1. `FORK_URL` env var (e.g. `FORK_URL=https://opt-mainnet.g.alchemy.com/v2/KEY bash scripts/local-dev.sh`)
2. `EXPO_PUBLIC_OP_RPC_URL` in `.env`
3. Optimism public RPC (`https://mainnet.optimism.io`) — free but slower

**Do NOT use WalletConnect RPC for forking** — it rate-limits and can't serve historical state for Uniswap pools. Use Alchemy, Infura, or the public endpoint.

## Manual Setup

If you prefer to run steps individually:

### Start Anvil

```bash
export EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_project_id>
export OP_FORK_URL="https://rpc.walletconnect.com/v1/?chainId=eip155:10&projectId=${EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID}"
anvil --fork-url "$OP_FORK_URL" --chain-id 10 --host 0.0.0.0 --port 8545
```

### Deploy LeverageManager

```bash
cd ../flash-loan-sol
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
```

### Configure app

1. Open Settings in the RN app.
2. Keep chain set to `Optimism`.
3. Set Custom RPC:
   - iOS simulator: `http://127.0.0.1:8545`
   - Android emulator: `http://10.0.2.2:8545`
4. Set LeverageManager address in `.env`:

```bash
EXPO_PUBLIC_LEVERAGE_MANAGER_ADDRESS_OP=0x...
```

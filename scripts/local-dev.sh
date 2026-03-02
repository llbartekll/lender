#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
FLASH_LOAN_DIR="$REPO_ROOT/../flash-loan-sol"

ANVIL_PORT=8545
RPC_URL="http://127.0.0.1:${ANVIL_PORT}"
DEPLOYER_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# --- Prereqs ---
for cmd in anvil forge curl; do
  command -v "$cmd" &>/dev/null || { echo "Error: $cmd not found. Install Foundry: https://getfoundry.sh"; exit 1; }
done
[[ -d "$FLASH_LOAN_DIR" ]] || { echo "Error: ../flash-loan-sol not found (expected at $FLASH_LOAN_DIR)"; exit 1; }
[[ -f "$REPO_ROOT/.env" ]] || { echo "Error: .env not found in $REPO_ROOT"; exit 1; }

source "$REPO_ROOT/.env"

# --- Resolve fork URL ---
# Priority: FORK_URL env var > EXPO_PUBLIC_OP_RPC_URL in .env > Optimism public RPC
if [[ -n "${FORK_URL:-}" ]]; then
  echo "Using FORK_URL from environment: $FORK_URL"
elif [[ -n "${EXPO_PUBLIC_OP_RPC_URL:-}" ]]; then
  FORK_URL="$EXPO_PUBLIC_OP_RPC_URL"
  echo "Using EXPO_PUBLIC_OP_RPC_URL from .env: $FORK_URL"
else
  FORK_URL="https://mainnet.optimism.io"
  echo "Using Optimism public RPC: $FORK_URL"
  echo "  (Tip: set FORK_URL or EXPO_PUBLIC_OP_RPC_URL for a faster RPC)"
fi

# --- Kill existing Anvil ---
echo "Killing any existing process on port $ANVIL_PORT..."
lsof -ti:$ANVIL_PORT | xargs kill -9 2>/dev/null || true

# --- Start Anvil ---
echo "Starting Anvil (forking Optimism)..."
anvil --fork-url "$FORK_URL" --chain-id 10 --host 0.0.0.0 --port $ANVIL_PORT \
  --compute-units-per-second 300 &
ANVIL_PID=$!
trap "kill $ANVIL_PID 2>/dev/null" EXIT

# Wait for ready
echo "Waiting for Anvil to be ready..."
for i in $(seq 1 30); do
  curl -sf "$RPC_URL" -X POST -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' &>/dev/null && break
  sleep 1
done

# Verify Anvil is responding
curl -sf "$RPC_URL" -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' &>/dev/null || {
  echo "Error: Anvil did not start within 30s"; exit 1;
}
echo "Anvil ready."

# --- Fund wallet (if EXPO_PUBLIC_TEST_WALLET is set) ---
if [[ -n "${EXPO_PUBLIC_TEST_WALLET:-}" ]]; then
  echo "Funding test wallet $EXPO_PUBLIC_TEST_WALLET with 10 ETH..."
  curl -sf "$RPC_URL" -X POST -H 'Content-Type: application/json' \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"anvil_setBalance\",\"params\":[\"$EXPO_PUBLIC_TEST_WALLET\",\"0x8AC7230489E80000\"],\"id\":1}" &>/dev/null
fi

# --- Deploy ---
echo "Deploying LeverageManager..."
OUTPUT=$(cd "$FLASH_LOAN_DIR" && DEPLOYER_PRIVATE_KEY="$DEPLOYER_KEY" \
  forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$RPC_URL" --broadcast 2>&1)

ADDRESS=$(echo "$OUTPUT" | grep -oE "0x[a-fA-F0-9]{40}" | tail -1)
[[ -n "$ADDRESS" ]] || { echo "Error: Could not extract deployed address"; echo "$OUTPUT"; exit 1; }

# --- Update .env ---
if grep -q "EXPO_PUBLIC_LEVERAGE_MANAGER_ADDRESS_OP" "$REPO_ROOT/.env"; then
  sed -i '' "s|EXPO_PUBLIC_LEVERAGE_MANAGER_ADDRESS_OP=.*|EXPO_PUBLIC_LEVERAGE_MANAGER_ADDRESS_OP=$ADDRESS|" "$REPO_ROOT/.env"
else
  echo "EXPO_PUBLIC_LEVERAGE_MANAGER_ADDRESS_OP=$ADDRESS" >> "$REPO_ROOT/.env"
fi

# --- Summary ---
echo ""
echo "======================================"
echo "  LeverageManager: $ADDRESS"
echo "  Anvil RPC:       $RPC_URL"
echo "  Fork source:     $FORK_URL"
echo "======================================"
echo ""
echo "  .env updated with new address."
echo "  In the app: Settings → Custom RPC → http://127.0.0.1:8545"
echo "  Then reload Expo (R)"
echo ""
echo "  Anvil running... (Ctrl+C to stop)"

# --- Wait ---
wait $ANVIL_PID

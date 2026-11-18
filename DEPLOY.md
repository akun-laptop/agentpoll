# AgentPoll — Deployment Guide

Deploy `AgentPoll` to **BNB Chain mainnet** (chain ID 56). No private keys are
stored in this repo; the deployer signs with their own wallet.

## Constructor argument

One argument — the Binance Agent ID contract address (mainnet):

```
0x60b9262456de011f7d15a54cdd8c48baaa8b022f
```

The contract stores it as an `immutable`. It cannot be changed after
deployment, so double-check the address before sending the transaction.

## Artifacts

- `artifacts/AgentPoll.abi.json` — the contract ABI (23 entries).
- `artifacts/AgentPoll.bytecode.txt` — the creation bytecode (4,501 bytes,
  `0x`-prefixed). Append the ABI-encoded constructor argument (the 20-byte
  Agent ID address, left-padded to 32 bytes) to the creation bytecode when
  deploying from raw bytecode.

## Estimated deployment gas

Measured locally (Hardhat, optimizer runs=200, solc 0.8.20):

| Item | Value |
| --- | --- |
| AgentPoll deployment gas | **996,253 gas** |
| Creation bytecode | 4,501 bytes |
| Deployed bytecode | 4,355 bytes |

BNB cost depends on the gas price at deploy time: ~0.001 BNB at 1 gwei,
~0.003 BNB at 3 gwei. Check the live BSC gas price before deploying.

## Steps

1. Fund the deployer wallet with a small amount of BNB (0.005 BNB covers
   deployment with margin at typical gas prices).
2. Deploy with the constructor argument above, using any of:
   - **Remix** (remix.ethereum.org): paste `contracts/AgentPoll.sol`,
     compile with solc 0.8.20 + optimizer (200 runs), deploy via
     "Injected Provider" (Binance Wallet / MetaMask on BNB Chain),
     constructor arg `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`.
   - **Hardhat**: add a `bsc` network + the deployer key to a local
     `.env` (never committed), then a deploy script calling
     `AgentPoll.deploy("0x60b9262456de011f7d15a54cdd8c48baaa8b022f")`.
   - **Raw bytecode**: send a transaction with `to` empty and `data` =
     `artifacts/AgentPoll.bytecode.txt` + ABI-encoded constructor arg.
3. Record the deployed address.
4. **Verify on BscScan** (required by the hackathon): verify the source
   with solc 0.8.20, optimizer enabled, 200 runs, and the constructor
   argument ABI-encoded. The contract has no imports, so verification is
   a single file.
5. Sanity-check on-chain: call `agentId()` (must return the Agent ID
   address above) and `getPollCount()` (must return 0).

## Safety notes

- The contract has **no owner, no pausing, no payable functions, and holds
  no funds**. There is nothing privileged to configure or revoke after
  deployment.
- The Agent ID gate reads `balanceOf` on the official Agent ID contract.
  Only addresses holding an Agent ID can create polls or vote.
- Deployment is one-way: the Agent ID address is immutable. If the wrong
  address is passed, the only fix is a fresh deployment.

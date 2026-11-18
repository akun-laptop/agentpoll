# AgentPoll

Sybil-resistant voting for the Binance Agent ID Hackathon. **One Agent ID,
one vote** — Agent IDs are non-transferable ERC-721s, one per user, so polls
here cannot be brigaded by bots or bought.

## How the Agent ID gate works

Every state-changing function (`createPoll`, `vote`) requires
`balanceOf(msg.sender) > 0` on the Binance Agent ID contract
(`0x60b9262456de011f7d15a54cdd8c48baaa8b022f` on BNB Chain mainnet). The
contract stores that address as an `immutable` set once in the constructor.
No Agent ID, no vote — and because an Agent ID cannot be transferred or
duplicated, one person cannot vote twice even across wallets.

## Contract

`contracts/AgentPoll.sol` (Solidity ^0.8.20, MIT, 137 lines):

- `createPoll(question, options, durationSeconds) → pollId` — 2–8 options,
  question ≤ 280 chars, duration 1 hour–30 days.
- `vote(pollId, optionIndex)` — one vote per holder per poll, only before
  the deadline.
- `getPoll(pollId)`, `getPollCount()`, `hasVoted(pollId, voter)` — views.

Deliberately minimal: **no owner, no pausing, no payable functions, no fund
handling**. The contract holds no funds and has no privileged permissions —
the cleanest possible answer to the hackathon's safety red lines.

## Test

```sh
npm install
npx hardhat test        # 17 tests, Hardhat Network (local only)
npx hardhat run scripts/estimate-gas.js   # deployment gas estimate
```

`contracts/MockAgentID.sol` is a test-only mock of the Agent ID ERC-721
(`balanceOf` + a one-per-address `mint`). It is not part of the
deliverable and must never be deployed as if it were the real Agent ID.

## Deploy

See [DEPLOY.md](DEPLOY.md). Deployment gas: **996,253**. The parent deploys
via the user's wallet; nothing here touches a live chain.

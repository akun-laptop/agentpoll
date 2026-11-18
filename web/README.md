# AgentPoll — web app

Next.js (App Router, TypeScript, Tailwind) frontend for **AgentPoll**, a
sybil-resistant voting dApp built for the Binance Agent ID Hackathon.
Pitch: **one Agent ID, one vote** — Agent IDs are non-transferable ERC-721s,
one per user, so polls here can't be brigaded by bots or bought.

## How the Agent ID gate works

- The smart contract (`../contracts/AgentPoll.sol`, BNB Chain mainnet) checks
  `balanceOf(msg.sender) > 0` on the Agent ID contract
  (`0x60b9262456de011f7d15a54cdd8c48baaa8b022f`) for every `createPoll` and
  `vote` call. The frontend mirrors that check so buttons show the right
  disabled reason before a transaction is even attempted.
- One vote per Agent ID holder per poll, enforced on-chain
  (`voted[pollId][voter]`). The contract has no owner, no payable functions,
  and holds no funds.

## Run

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
npm run build                # production build (must pass before deploying)
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_AGENT_POLL_ADDRESS` | Yes (for a live site) | Deployed AgentPoll contract on BNB Chain mainnet (chain 56). If unset, the app shows a "contract not deployed yet" state instead of crashing. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | WalletConnect Cloud project id. Without it, only injected wallets (Binance Wallet / MetaMask) are offered. |

## Structure

- `app/` — Home (poll list), `/create` (poll form), `/poll/[id]` (detail + voting).
- `components/` — `Header`, `ConnectButton` (wagmi), `PollCard`, `PollDetail`, `CreatePollForm`, `Providers` (wagmi + react-query).
- `lib/config.ts` — wagmi config (BSC mainnet only), contract addresses, ABI import.
- `lib/agentpoll-abi.json` — ABI copied verbatim from `../artifacts/AgentPoll.abi.json`.
- `lib/hooks.ts` — chain reads (`usePolls`, `usePoll`, `useHasVoted`, `useIsAgentIdHolder`).
- `lib/polls.ts` — poll parsing, formatting, error mapping.

## Notes for deployment

- The site is a standard Next.js app; deploy to Vercel (or any Next.js host)
  with the two env vars above. The contract address can only be set after the
  contract is deployed — set it in the host's env vars, then redeploy.
- Reads use the public BSC endpoint `https://bsc-dataseed.bnbchain.org`.

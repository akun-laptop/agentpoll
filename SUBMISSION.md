# AgentPoll — Hackathon Submission Pack (draft, ready to paste)

Source: Binance Agent ID Hackathon announcement (2026-11-18). Submission period
ends 2026-12-09 08:00 UTC. One project per team. Awards: Agent ID Ecosystem
Pioneer Award + Agent Application Innovation Award (29,000 USDC each, top 10).

## Status
- [x] Contract built + tested (17/17 Hardhat tests pass)
- [x] Frontend built (Next.js, build passes)
- [x] Code public on GitHub: https://github.com/akun-laptop/agentpoll
- [ ] Contract deployed to BSC mainnet (user deploys via Remix)
- [ ] Contract verified on BscScan
- [ ] Website deployed (Vercel; needs contract address first)
- [ ] ≥30 Agent ID addresses interacted (user promotes)
- [ ] Submitted (route TBD — see below)

## Submission route (as of 2026-11-18 19:49 WIB)
No project submission form link was found in the announcement text or the
Binance Square copy. The only linked form is the Community Promotion survey
(app.binance.com/uni-qr/user-survey/ff6832f8d2984af289068c9450a3c98c), which
opens in the Binance App — it may or may not also accept project submissions.
CHECK when the project is live: open the survey in the Binance App and look
for a project-submission section; also check the Binance Wallet Agentic
Wallet ecosystem page and @BinanceWallet on X for a submission link.

## Project name
AgentPoll

## Tagline
One Agent ID, one vote.

## Description (short)
AgentPoll is a sybil-resistant voting dApp on BNB Chain. Every poll creation
and every vote requires the caller to hold a Binance Agent ID, checked
on-chain. Because Agent IDs are non-transferable ERC-721s and each user can
hold only one, a poll on AgentPoll cannot be brigaded by bots, farmed with
fresh wallets, or bought — one person, one vote, verifiable by anyone.

## Agent ID usage description (for the submission form)
Agent ID is the core access primitive of the whole product, not an add-on:
- The AgentPoll contract stores the Agent ID contract address
  (0x60b9262456de011f7d15a54cdd8c48baaa8b022f) as an immutable and calls
  balanceOf(msg.sender) on every createPoll and every vote. Any address
  without an Agent ID reverts with NotAgentIDHolder.
- One vote per Agent ID holder per poll is enforced on-chain
  (mapping pollId => voter => voted); double-voting reverts.
- The frontend reads the same balanceOf check to gate the UI and shows an
  Agent ID holder badge for connected wallets.
- No other identity system is used anywhere in the product. There is no
  allowlist, no off-chain login, and no admin override.

## Links (fill in after deploy)
- Website: TBD (Vercel, after contract address exists)
- GitHub: https://github.com/akun-laptop/agentpoll
- Contract (BSC mainnet): TBD — user deploys via Remix
- BscScan (verified): TBD after verification

## Team
Solo: Zaxzz (Ganang Syaifullah) — Agent ID zaxzz.ai.
Built with Kai (Muse personal AI agent): contract + frontend authored by
AI subagents, reviewed by the parent agent, deployed by the user.

## Reward receiving address (confirm with user before submitting)
User's Agentic Wallet (BSC): 0x3de2980f43f068b7786A2596f6a89D2f7eE07dcC

## Safety red-line compliance (for the judges / form)
- No owner, no pausing, no payable functions, no fund handling: the contract
  holds no funds and has zero privileged permissions. Nothing to disclose
  because there are no owner powers at all.
- No web QR login, no stored sessions, no prompts that bypass confirmation:
  users connect their own wallet (injected / WalletConnect) and confirm
  every transaction themselves in their wallet.
- No unauthorized transfers, no approvals requested (the contract never
  moves user assets; votes and poll creation are plain contract calls).
- No credential collection of any kind.
- No returns promised anywhere; no token, no "passive income" language.
- No Binance/BNB branding in the project name, token (none), or domain.
- Agent ID is used for access control (voting rights), never packaged as a
  tool for looking up other people's wallets.
- No volume manipulation: interactions come from genuine promotion to the
  Agent ID community.

## Judging criteria mapping (Innovation Award, 100 pts)
- Agent ID depth (30%): the gate IS the product — every state-changing call
  requires an Agent ID, checked on-chain.
- Practicality (25%): communities, DAOs, and agent collectives need polls
  that bots cannot rig; AgentPoll is the first voting dApp built on the
  non-transferable Agent ID primitive.
- Completion (25%): live website with create/vote/results, verified
  open-source contract, tested (17/17).
- Innovation (20%): turns Agent ID's non-transferability into a
  sybil-resistance guarantee for voting — a use case no other entry type
  (tip jars, faucets, chat) offers.

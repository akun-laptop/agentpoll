import { http, createConfig } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import type { Abi, Address } from "viem";
import agentpollAbiJson from "./agentpoll-abi.json";

/** Binance Agent ID (SPACE ID Agent ID) contract on BNB Chain mainnet. ERC-721, non-transferable, one per user. */
export const AGENT_ID_ADDRESS =
  "0x60b9262456de011f7d15a54cdd8c48baaa8b022f" as Address;

/** Minimal ABI for the Agent ID gate check: balanceOf > 0 means the address holds an Agent ID. */
export const AGENT_ID_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/** Full AgentPoll ABI, copied verbatim from the contract build artifacts. */
export const AGENTPOLL_ABI = agentpollAbiJson as unknown as Abi;

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

const envAddress = process.env.NEXT_PUBLIC_AGENT_POLL_ADDRESS;

/** Deployed AgentPoll address, or null when the contract is not deployed yet. */
export const AGENTPOLL_ADDRESS: Address | null =
  envAddress && (envAddress as Address) !== ZERO_ADDRESS
    ? (envAddress as Address)
    : null;

export const IS_DEPLOYED = AGENTPOLL_ADDRESS !== null;

export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const BSCSCAN_TX = "https://bscscan.com/tx/";
export const BSCSCAN_ADDRESS = "https://bscscan.com/address/";

/** BSC mainnet only. WalletConnect is offered only when a project id is configured. */
export const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: WALLETCONNECT_PROJECT_ID
    ? [injected(), walletConnect({ projectId: WALLETCONNECT_PROJECT_ID })]
    : [injected()],
  ssr: true,
  transports: {
    [bsc.id]: http("https://bsc-dataseed.bnbchain.org"),
  },
});

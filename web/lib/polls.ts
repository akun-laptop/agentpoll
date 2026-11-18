import type { Address } from "viem";

export type Poll = {
  id: number;
  creator: Address;
  question: string;
  options: string[];
  votes: bigint[];
  deadline: bigint;
  createdAt: bigint;
  totalVotes: bigint;
};

/** getPoll return order: (creator, question, options, votes, deadline, createdAt, totalVotes). Poll IDs are 0-indexed. */
export function parsePoll(id: number, raw: unknown): Poll | null {
  if (!Array.isArray(raw) || raw.length < 7) return null;
  const [creator, question, options, votes, deadline, createdAt, totalVotes] =
    raw as [
      Address,
      string,
      readonly string[],
      readonly bigint[],
      bigint,
      bigint,
      bigint,
    ];
  if (typeof question !== "string" || !Array.isArray(options)) return null;
  return {
    id,
    creator,
    question,
    options: [...options],
    votes: [...votes],
    deadline,
    createdAt,
    totalVotes,
  };
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function isClosed(poll: Poll, nowSec: number = Date.now() / 1000): boolean {
  return nowSec >= Number(poll.deadline);
}

export function timeRemaining(deadline: bigint): string {
  const secs = Number(deadline) - Date.now() / 1000;
  if (secs <= 0) return "Closed";
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m left`;
  return `${Math.floor(secs)}s left`;
}

export function votePct(votes: bigint, total: bigint): number {
  if (total === BigInt(0)) return 0;
  return Math.round((Number(votes) / Number(total)) * 100);
}

export const DURATIONS = [
  { label: "1 hour", seconds: 3600 },
  { label: "6 hours", seconds: 21600 },
  { label: "1 day", seconds: 86400 },
  { label: "3 days", seconds: 259200 },
  { label: "7 days", seconds: 604800 },
  { label: "30 days", seconds: 2592000 },
] as const;

/** The contract measures length in bytes, so validate UTF-8 byte length, not char count. */
export function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

/** Turn a wagmi/viem error (including the contract's custom errors) into a human-readable message. */
export function friendlyError(err: unknown): string {
  const msg =
    (err as { shortMessage?: string; message?: string } | null)?.shortMessage ??
    (err as { message?: string } | null)?.message ??
    "";
  if (/user rejected/i.test(msg)) return "Transaction rejected in your wallet.";
  if (/NotAgentIDHolder/i.test(msg))
    return "You need an Agent ID to do this — claim one in the Binance App (Wallet → Agent ID).";
  if (/AlreadyVoted/i.test(msg)) return "You have already voted on this poll.";
  if (/PollClosed/i.test(msg)) return "This poll is closed.";
  if (/PollNotFound/i.test(msg)) return "Poll not found.";
  if (/InvalidOption/i.test(msg)) return "Invalid option.";
  if (/InvalidQuestion/i.test(msg))
    return "Invalid question — it must be 1–280 bytes.";
  if (/InvalidOptions/i.test(msg))
    return "Invalid options — 2–8 options, each 1–100 bytes.";
  if (/InvalidDuration/i.test(msg))
    return "Invalid duration — between 1 hour and 30 days.";
  if (/insufficient funds/i.test(msg))
    return "Insufficient BNB for gas on BNB Chain.";
  return msg || "Something went wrong. Please try again.";
}

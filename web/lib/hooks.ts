"use client";

import { useReadContract, useReadContracts } from "wagmi";
import type { Address } from "viem";
import {
  AGENTPOLL_ABI,
  AGENTPOLL_ADDRESS,
  AGENT_ID_ABI,
  AGENT_ID_ADDRESS,
} from "./config";
import { parsePoll, type Poll } from "./polls";

/** True when the address holds an Agent ID (balanceOf > 0 on the Agent ID contract). */
export function useIsAgentIdHolder(address?: Address) {
  const { data, isLoading } = useReadContract({
    address: AGENT_ID_ADDRESS,
    abi: AGENT_ID_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const balance = (data as bigint | undefined) ?? BigInt(0);
  return { isHolder: balance > BigInt(0), isLoading };
}

export function usePollCount() {
  const { data, isLoading, error } = useReadContract({
    address: AGENTPOLL_ADDRESS ?? undefined,
    abi: AGENTPOLL_ABI,
    functionName: "getPollCount",
    query: { enabled: AGENTPOLL_ADDRESS !== null },
  });
  const count = (data as bigint | undefined) ?? BigInt(0);
  return { count: Number(count), isLoading, error };
}

/** All polls, newest first. */
export function usePolls() {
  const { count, isLoading: countLoading } = usePollCount();
  const ids = Array.from({ length: count }, (_, i) => count - 1 - i);
  const { data, isLoading } = useReadContracts({
    contracts: ids.map((id) => ({
      address: AGENTPOLL_ADDRESS as Address,
      abi: AGENTPOLL_ABI,
      functionName: "getPoll",
      args: [BigInt(id)],
    })),
    query: { enabled: AGENTPOLL_ADDRESS !== null && count > 0 },
  });
  const polls = ((data ?? []) as { status: string; result?: unknown }[])
    .map((r, i) =>
      r.status === "success" ? parsePoll(ids[i], r.result) : null,
    )
    .filter((p): p is Poll => p !== null);
  return { polls, isLoading: countLoading || isLoading };
}

export function usePoll(id: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: AGENTPOLL_ADDRESS ?? undefined,
    abi: AGENTPOLL_ABI,
    functionName: "getPoll",
    args: [BigInt(id)],
    query: {
      enabled:
        AGENTPOLL_ADDRESS !== null && Number.isInteger(id) && id >= 0,
    },
  });
  const poll = data ? parsePoll(id, data) : null;
  return { poll, isLoading, error, refetch };
}

export function useHasVoted(pollId: number, voter?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: AGENTPOLL_ADDRESS ?? undefined,
    abi: AGENTPOLL_ABI,
    functionName: "hasVoted",
    args: voter ? [BigInt(pollId), voter] : undefined,
    query: { enabled: AGENTPOLL_ADDRESS !== null && !!voter },
  });
  return { hasVoted: !!(data as boolean | undefined), isLoading, refetch };
}

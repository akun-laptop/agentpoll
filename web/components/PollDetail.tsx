"use client";

import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AGENTPOLL_ABI, AGENTPOLL_ADDRESS, BSCSCAN_ADDRESS, BSCSCAN_TX } from "@/lib/config";
import { useHasVoted, useIsAgentIdHolder, usePoll } from "@/lib/hooks";
import {
  friendlyError,
  isClosed,
  shortAddress,
  timeRemaining,
  votePct,
} from "@/lib/polls";

export default function PollDetail({ id }: { id: number }) {
  const { poll, isLoading, error, refetch } = usePoll(id);
  const { address, isConnected } = useAccount();
  const { isHolder, isLoading: holderLoading } = useIsAgentIdHolder(address);
  const { hasVoted, refetch: refetchVoted } = useHasVoted(id, address);
  const [picked, setPicked] = useState<number | null>(null);

  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
      refetchVoted();
    }
  }, [isConfirmed, refetch, refetchVoted]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-3/4 rounded-lg bg-zinc-800" />
        <div className="h-12 rounded-xl bg-zinc-800" />
        <div className="h-12 rounded-xl bg-zinc-800" />
        <div className="h-12 rounded-xl bg-zinc-800" />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Poll not found. It may not exist yet, or the contract could not be
        reached.
      </div>
    );
  }

  const closed = isClosed(poll);
  const voteDisabledReason = !isConnected
    ? "Connect your wallet to vote."
    : holderLoading
      ? "Checking your Agent ID…"
      : !isHolder
        ? "You need an Agent ID to vote — claim one free in the Binance App (Wallet → Agent ID)."
        : hasVoted
          ? "You have already voted on this poll."
          : closed
            ? "This poll is closed."
            : null;

  const onVote = () => {
    if (picked === null || voteDisabledReason || !AGENTPOLL_ADDRESS) return;
    writeContract({
      address: AGENTPOLL_ADDRESS,
      abi: AGENTPOLL_ABI,
      functionName: "vote",
      args: [BigInt(id), BigInt(picked)],
    });
  };

  return (
    <article>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold leading-snug tracking-tight text-zinc-50">
          {poll.question}
        </h1>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            closed ? "bg-zinc-800 text-zinc-400" : "bg-gold/15 text-gold"
          }`}
        >
          {closed ? "Closed" : timeRemaining(poll.deadline)}
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-500">
        Created by{" "}
        <a
          href={`${BSCSCAN_ADDRESS}${poll.creator}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-200"
        >
          {shortAddress(poll.creator)}
        </a>{" "}
        · {poll.totalVotes.toString()}{" "}
        {poll.totalVotes === BigInt(1) ? "vote" : "votes"} · one Agent ID, one vote
      </p>

      <div className="mt-6 space-y-3">
        {poll.options.map((opt, i) => {
          const pct = votePct(poll.votes[i], poll.totalVotes);
          const selected = picked === i;
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              disabled={!!voteDisabledReason}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-gold bg-gold/10"
                  : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-600"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-100">{opt}</span>
                <span className="font-mono text-xs text-zinc-400">
                  {pct}% · {poll.votes[i].toString()}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${selected ? "bg-gold" : "bg-zinc-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {voteDisabledReason && (
        <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-400">
          {voteDisabledReason}
        </p>
      )}

      {!voteDisabledReason && (
        <button
          onClick={onVote}
          disabled={picked === null || isWriting || isConfirming}
          className="mt-4 w-full rounded-full bg-gold py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isWriting
            ? "Confirm in your wallet…"
            : isConfirming
              ? "Confirming on-chain…"
              : picked === null
                ? "Select an option to vote"
                : `Vote for “${poll.options[picked]}”`}
        </button>
      )}

      {isConfirmed && hash && (
        <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          ✓ Vote confirmed on-chain.{" "}
          <a
            href={`${BSCSCAN_TX}${hash}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            View on BscScan
          </a>
        </p>
      )}

      {writeError && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {friendlyError(writeError)}
        </p>
      )}

      {isConfirming && hash && (
        <p className="mt-4 text-sm text-zinc-400">
          Transaction submitted — waiting for confirmation.{" "}
          <a
            href={`${BSCSCAN_TX}${hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-gold underline underline-offset-2"
          >
            BscScan
          </a>
        </p>
      )}
    </article>
  );
}

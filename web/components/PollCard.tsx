"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useHasVoted } from "@/lib/hooks";
import {
  isClosed,
  shortAddress,
  timeRemaining,
  votePct,
  type Poll,
} from "@/lib/polls";

export default function PollCard({ poll }: { poll: Poll }) {
  const { address } = useAccount();
  const { hasVoted } = useHasVoted(poll.id, address);
  const closed = isClosed(poll);
  const leading = poll.votes.reduce(
    (best, v, i) => (v > poll.votes[best] ? i : best),
    0,
  );

  return (
    <Link
      href={`/poll/${poll.id}`}
      className="block rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:border-zinc-600 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-zinc-50">
          {poll.question}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            closed
              ? "bg-zinc-800 text-zinc-400"
              : "bg-gold/15 text-gold"
          }`}
        >
          {closed ? "Closed" : timeRemaining(poll.deadline)}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {poll.options.map((opt, i) => {
          const pct = votePct(poll.votes[i], poll.totalVotes);
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">
                  {opt}
                  {poll.totalVotes > BigInt(0) && i === leading && !closed && (
                    <span className="ml-2 text-xs text-gold">Leading</span>
                  )}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {pct}% · {poll.votes[i].toString()}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${i === leading && poll.totalVotes > BigInt(0) ? "bg-gold" : "bg-zinc-600"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>
          {poll.totalVotes.toString()}{" "}
          {poll.totalVotes === BigInt(1) ? "vote" : "votes"} · by{" "}
          {shortAddress(poll.creator)}
        </span>
        {hasVoted && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-400">
            ✓ You voted
          </span>
        )}
      </div>
    </Link>
  );
}

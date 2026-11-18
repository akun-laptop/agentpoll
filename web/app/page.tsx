"use client";

import Link from "next/link";
import { IS_DEPLOYED } from "@/lib/config";
import { usePolls } from "@/lib/hooks";
import NotDeployed from "@/components/NotDeployed";
import PollCard from "@/components/PollCard";

export default function Home() {
  const { polls, isLoading } = usePolls();

  return (
    <div>
      <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          One Agent ID, <span className="text-gold">one vote.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Agent IDs are non-transferable and one per user — so a poll here
          can&apos;t be brigaded by bots or bought. Create a poll, share it,
          and let the Agent ID community decide. Every vote is on-chain on BNB
          Chain.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/create"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            + Create a poll
          </Link>
          <a
            href="https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            About the Agent ID Hackathon
          </a>
        </div>
      </section>

      {!IS_DEPLOYED && (
        <div className="mt-6">
          <NotDeployed />
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Polls</h2>
        {isLoading ? (
          <div className="mt-4 space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/70"
              />
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-800 px-4 py-10 text-center">
            <p className="text-sm text-zinc-400">
              No polls yet — be the first to ask the community something.
            </p>
            <Link
              href="/create"
              className="mt-4 inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
            >
              + Create the first poll
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

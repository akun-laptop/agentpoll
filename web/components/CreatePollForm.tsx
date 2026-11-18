"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { parseEventLogs } from "viem";
import { AGENTPOLL_ABI, AGENTPOLL_ADDRESS, BSCSCAN_TX } from "@/lib/config";
import { useIsAgentIdHolder } from "@/lib/hooks";
import { byteLength, DURATIONS, friendlyError } from "@/lib/polls";

const MAX_OPTIONS = 8;

export default function CreatePollForm() {
  const { address, isConnected } = useAccount();
  const { isHolder, isLoading: holderLoading } = useIsAgentIdHolder(address);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [duration, setDuration] = useState<number>(DURATIONS[2].seconds);
  const [createdPollId, setCreatedPollId] = useState<bigint | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error: writeError,
    reset,
  } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Decode the PollCreated event to find the new poll's id.
  useEffect(() => {
    if (!isConfirmed || !receipt) return;
    try {
      const logs = parseEventLogs({
        abi: AGENTPOLL_ABI,
        eventName: "PollCreated",
        logs: receipt.logs,
      }) as unknown as { args: { pollId: bigint } }[];
      if (logs.length > 0) setCreatedPollId(logs[0].args.pollId);
    } catch {
      // Poll was created; the link is a nicety, not a requirement.
    }
  }, [isConfirmed, receipt]);

  const trimmedOptions = options.map((o) => o.trim());
  const questionBytes = byteLength(question.trim());
  const valid =
    questionBytes >= 1 &&
    questionBytes <= 280 &&
    trimmedOptions.length >= 2 &&
    trimmedOptions.length <= MAX_OPTIONS &&
    trimmedOptions.every((o) => byteLength(o) >= 1 && byteLength(o) <= 100);

  const setOption = (i: number, value: string) =>
    setOptions((prev) => prev.map((o, j) => (j === i ? value : o)));
  const addOption = () =>
    setOptions((prev) => (prev.length < MAX_OPTIONS ? [...prev, ""] : prev));
  const removeOption = (i: number) =>
    setOptions((prev) => (prev.length > 2 ? prev.filter((_, j) => j !== i) : prev));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!valid) {
      setFormError(
        "Check your inputs: question 1–280 bytes, 2–8 options, each option 1–100 bytes.",
      );
      return;
    }
    if (!AGENTPOLL_ADDRESS) return;
    reset();
    setCreatedPollId(null);
    writeContract({
      address: AGENTPOLL_ADDRESS,
      abi: AGENTPOLL_ABI,
      functionName: "createPoll",
      args: [question.trim(), trimmedOptions, BigInt(duration)],
    });
  };

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-6 text-center text-sm text-zinc-400">
        Connect your wallet to create a poll.
      </div>
    );
  }

  if (!holderLoading && !isHolder) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-6 text-center text-sm text-amber-200">
        <span className="font-semibold">You need an Agent ID to create polls.</span>
        <br />
        Agent IDs are free — claim one in the Binance App (Wallet → Agent ID),
        then come back here.
      </div>
    );
  }

  if (isConfirmed && hash) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-6 text-center text-sm text-emerald-200">
        <p className="text-base font-semibold">✓ Poll created!</p>
        <p className="mt-2">
          <a
            href={`${BSCSCAN_TX}${hash}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            View the transaction on BscScan
          </a>
        </p>
        {createdPollId !== null ? (
          <p className="mt-3">
            <Link
              href={`/poll/${createdPollId.toString()}`}
              className="inline-block rounded-full bg-gold px-5 py-2 font-semibold text-zinc-950 transition hover:bg-amber-300"
            >
              View your poll
            </Link>
          </p>
        ) : (
          <p className="mt-3">
            <Link href="/" className="text-gold underline underline-offset-2">
              Back to all polls
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="question"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Question
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          placeholder="What should the Agent ID community decide?"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-gold focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-zinc-500">
          {questionBytes}/280 bytes
        </p>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Options (2–8)
        </span>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-gold focus:outline-none"
              />
              <span className="w-12 shrink-0 text-right font-mono text-xs text-zinc-500">
                {byteLength(opt)}/100
              </span>
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
                aria-label={`Remove option ${i + 1}`}
                className="shrink-0 rounded-lg border border-zinc-700 px-2.5 py-2 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {options.length < MAX_OPTIONS && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 rounded-full border border-zinc-700 px-4 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            + Add option
          </button>
        )}
      </div>

      <div>
        <label
          htmlFor="duration"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Voting duration
        </label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 focus:border-gold focus:outline-none"
        >
          {DURATIONS.map((d) => (
            <option key={d.seconds} value={d.seconds}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {formError && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {formError}
        </p>
      )}
      {writeError && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {friendlyError(writeError)}
        </p>
      )}
      {isConfirming && hash && (
        <p className="text-sm text-zinc-400">
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

      <button
        type="submit"
        disabled={!valid || isWriting || isConfirming || holderLoading}
        className="w-full rounded-full bg-gold py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isWriting
          ? "Confirm in your wallet…"
          : isConfirming
            ? "Creating your poll…"
            : "Create poll"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Creating a poll costs a small BNB gas fee. No other payment is involved.
      </p>
    </form>
  );
}

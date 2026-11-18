"use client";

import { useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { bsc } from "wagmi/chains";
import { useIsAgentIdHolder } from "@/lib/hooks";
import { shortAddress } from "@/lib/polls";

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { isHolder, isLoading: holderLoading } = useIsAgentIdHolder(address);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          Connect Wallet
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-xl shadow-black/50">
            {connectors.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setMenuOpen(false);
                  connect({ connector: c });
                }}
                disabled={isPending}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
              >
                {c.id === "injected"
                  ? "Browser wallet (Binance / MetaMask)"
                  : c.name}
              </button>
            ))}
            <p className="px-3 pt-2 text-xs leading-relaxed text-zinc-500">
              Voting and creating polls require an Agent ID — claim one free in
              the Binance App (Wallet → Agent ID).
            </p>
          </div>
        )}
      </div>
    );
  }

  if (chainId !== bsc.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: bsc.id })}
        disabled={isSwitching}
        className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
      >
        {isSwitching ? "Switching…" : "Switch to BNB Chain"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowAccount((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500"
      >
        <span
          className={`h-2 w-2 rounded-full ${holderLoading ? "bg-zinc-500" : isHolder ? "bg-gold" : "bg-zinc-500"}`}
          title={isHolder ? "Holds an Agent ID" : "No Agent ID detected"}
        />
        {shortAddress(address!)}
      </button>
      {showAccount && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900 p-3 shadow-xl shadow-black/50">
          <p className="break-all font-mono text-xs text-zinc-400">{address}</p>
          <p className="mt-2 text-sm">
            {holderLoading ? (
              "Checking Agent ID…"
            ) : isHolder ? (
              <span className="font-medium text-gold">
                ✓ Agent ID holder — you can vote &amp; create polls
              </span>
            ) : (
              <span className="text-zinc-400">
                No Agent ID detected. Claim one free in the Binance App
                (Wallet → Agent ID) to vote &amp; create polls.
              </span>
            )}
          </p>
          <button
            onClick={() => {
              setShowAccount(false);
              disconnect();
            }}
            className="mt-3 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

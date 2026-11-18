/** Shown when NEXT_PUBLIC_AGENT_POLL_ADDRESS is unset — the contract is not deployed yet. */
export default function NotDeployed() {
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <span className="font-semibold">Contract not deployed yet.</span> The
      AgentPoll smart contract hasn&apos;t been deployed to BNB Chain, so polls
      can&apos;t be loaded or created right now. Check back soon.
    </div>
  );
}

"use client";

import { IS_DEPLOYED } from "@/lib/config";
import NotDeployed from "@/components/NotDeployed";
import CreatePollForm from "@/components/CreatePollForm";

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Create a poll</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Only Agent ID holders can create polls. Your poll lives on-chain on BNB
        Chain — anyone with an Agent ID can vote once, and the results are
        public and tamper-proof.
      </p>
      <div className="mt-6">
        {!IS_DEPLOYED ? <NotDeployed /> : <CreatePollForm />}
      </div>
    </div>
  );
}

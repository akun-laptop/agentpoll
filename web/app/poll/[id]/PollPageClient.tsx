"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IS_DEPLOYED } from "@/lib/config";
import NotDeployed from "@/components/NotDeployed";
import PollDetail from "@/components/PollDetail";

function DetailInner() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  if (!IS_DEPLOYED) return <NotDeployed />;

  if (!Number.isInteger(id) || id < 0) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Invalid poll id.{" "}
        <Link href="/" className="underline underline-offset-2">
          Back to all polls
        </Link>
      </div>
    );
  }

  return <PollDetail id={id} />;
}

export default function PollPageClient() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-3/4 rounded-lg bg-zinc-800" />
          <div className="h-12 rounded-xl bg-zinc-800" />
          <div className="h-12 rounded-xl bg-zinc-800" />
        </div>
      }
    >
      <DetailInner />
    </Suspense>
  );
}

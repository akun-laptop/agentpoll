import Link from "next/link";
import ConnectButton from "./ConnectButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-zinc-50">
            Agent<span className="text-gold">Poll</span>
          </span>
          <span className="hidden text-xs text-zinc-500 sm:inline">
            One Agent ID, one vote
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-sm text-zinc-300 transition hover:text-zinc-50"
          >
            Polls
          </Link>
          <Link
            href="/create"
            className="rounded-full bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
          >
            + Create poll
          </Link>
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}

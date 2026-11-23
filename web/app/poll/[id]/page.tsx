import PollPageClient from "./PollPageClient";

// Static export (GitHub Pages) needs every dynamic route pre-generated at
// build time. Polls are numbered from 0, so pre-generate ids 0..49; the
// client component still reads the id from the URL at runtime.
export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({ id: String(i) }));
}

export default function PollPage() {
  return <PollPageClient />;
}

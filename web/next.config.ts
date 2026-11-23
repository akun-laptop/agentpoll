import type { NextConfig } from "next";

// Static export for GitHub Pages: build with STATIC_EXPORT=1.
// Normal (Vercel) builds are unchanged.
const isStaticExport = process.env.STATIC_EXPORT === "1";

// GitHub Pages serves the project site under /agentpoll, so the export
// needs output 'export' plus that basePath. Cache Components (PPR) cannot
// run in export mode ("Invariant: PPR cannot be enabled in export mode"),
// so it and Partial Prefetching are off here. No server features are used
// (no API routes, no headers/cookies), so the whole app exports cleanly.
const staticExportConfig: NextConfig = {
  output: "export",
  basePath: "/agentpoll",
  // GitHub Pages serves /create/ from create/index.html; without
  // trailingSlash the export emits flat create.html and /create/ 404s.
  trailingSlash: true,
  cacheComponents: false,
  partialPrefetching: false,
};

const nextConfig: NextConfig = {
  /* config options here */
  ...(isStaticExport
    ? staticExportConfig
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

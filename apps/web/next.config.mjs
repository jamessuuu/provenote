/**
 * Static export, zero server functions. provenote's central claim is
 * zero-upload (docs/SPEC.md D1) — a site that could not, even in
 * principle, run without a server backs that claim structurally, not
 * just by promise. Enforced further by scripts/check-zero-functions.mjs
 * after every build.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@provenote/core"],
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;

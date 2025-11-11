/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@atelie/shared"],
  // Vercel optimizations
  output: "standalone",
  // Ensure monorepo packages are included
  outputFileTracingRoot: require("path").join(__dirname, "../.."),
};

module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Uploads werden bewusst ausserhalb von /public abgelegt und ueber eine
  // geschuetzte API-Route ausgeliefert (siehe src/app/api/media/[id]/file).
  experimental: {
    serverActions: {
      bodySizeLimit: "256mb",
    },
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Ensure server-only packages are not bundled for client
  serverExternalPackages: ['mongoose', 'bcryptjs', 'razorpay'],
};

export default nextConfig;

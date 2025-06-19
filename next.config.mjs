/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    serverExternalPackages: ['bcrypt', 'jsonwebtoken'],
  };
  
  export default nextConfig;
  
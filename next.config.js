/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'smupwjlilkhxqtyeouxg.supabase.co', // Replace with your Supabase project ID
        port: '',
        pathname: '/storage/v1/object/public/user-media/**',
      },
    ],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com'],
  },
  env: {
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    API_URL : process.env.API_URL,
    EMBED_URL : process.env.EMBED_URL,
    SITE_URL: process.env.SITE_URL,
    NEXT_PUBLIC_PRODUCTION : process.env.NEXT_PUBLIC_PRODUCTION,
    NEXT_PUBLIC_GOOGLE_TAG_ID : process.env.NEXT_PUBLIC_GOOGLE_TAG_ID,
    NEXT_PUBLIC_FACEBOOK_ID : process.env.NEXT_PUBLIC_FACEBOOK_ID,
    NEXT_PUBLIC_INTERCOME_APP_ID: process.env.NEXT_PUBLIC_INTERCOME_APP_ID
  },
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "scratchyourmapa.com" },
      { protocol: "https", hostname: "ghostaroundtheglobe.com" },
      { protocol: "https", hostname: "www.digitalstudioindia.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "oecjiyotsuwvepgzmujs.supabase.co" }
    ]
  }
};

module.exports = nextConfig;

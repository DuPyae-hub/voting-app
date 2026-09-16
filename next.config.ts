// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // လောလောဆယ် မည်သည့်လင့်ခ်မှမဆို ပုံယူခွင့်ပြုထားသည် (Supabase လင့်ခ်အပါအဝင်)
      },
    ],
  },
};

export default nextConfig;
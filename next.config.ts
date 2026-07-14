import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Always render SEO meta tags in <head> (disable streaming metadata)
  htmlLimitedBots: /.*/,
};

export default nextConfig;

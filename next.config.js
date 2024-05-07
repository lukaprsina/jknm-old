import "./src/env.js";
import nextMDX from "@next/mdx";

const withMDX = nextMDX({
  extension: /\.(md|mdx)$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  experimental: {
    mdxRs: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'jamarski-klub-novo-mesto.s3.eu-central-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'jamarski-klub-novo-mesto.s3.eu-central-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: '*',
        port: '',
        pathname: '**',
      },
    ],
    // jamarski-klub-novo-mesto.s3.eu-central-1.amazonaws.com
  },
};

export default withMDX(nextConfig);

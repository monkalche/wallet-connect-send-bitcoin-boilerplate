/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-testnet.unisat.io",
        port: "",
        pathname: "/preview/**",
      },
      {
        protocol: "https",
        hostname: "static.unisat.io",
        port: "",
        pathname: "/preview/**",
      },
      {
        protocol: "https",
        hostname: "algonrich-s3-bucket.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "testnet-explorer.ordinalsbot.com",
        port: "",
        pathname: "/content/**",
      },
      {
        protocol: "https",
        hostname: "explorer.ordinalsbot.com",
        port: "",
        pathname: "/content/**",
      },
      {
        protocol: "https",
        hostname: "img-cdn.magiceden.dev",
        port: "",
        pathname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * @description Web3Modal requirement for SSR
   * @see {@link https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration}
   */
  // webpack: (config) => {
  //   config.externals.push("pino-pretty", "lokijs", "encoding");
  //   return config;
  // },
  webpack: (config, context) => {
    if (config.plugins) {
      config.plugins.push(
        new context.webpack.IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
        })
      );
    }
    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Enables logging out caching info
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;

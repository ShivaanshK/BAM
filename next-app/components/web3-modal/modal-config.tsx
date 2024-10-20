import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { defineChain } from "viem";

import { cookieStorage, createStorage, http } from "wagmi";
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from "wagmi/chains";

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

export const metadata = {
  name: "BAM",
  description: "Bimodal Action Market",
  url: "http://localhost:3000", // origin must match your domain & subdomain
  icons: ["/icon.png"],
};

export const litTestnet = defineChain({
  id: 175188,
  name: "Lit Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tstLPX",
    symbol: "tstLPX",
  },
  rpcUrls: {
    default: {
      http: ["https://yellowstone-rpc.litprotocol.com"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.zora.energy" },
  },
});

// Create wagmiConfig
const chains = [
  // mainnet,
  // sepolia,
  // arbitrum,
  // arbitrumSepolia,
  litTestnet,
  sepolia,
] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  batch: {
    multicall: true,
  },
});

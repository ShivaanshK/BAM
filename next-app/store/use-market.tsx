import { create } from "zustand";

interface UseMarketState {
  activeTab: "create" | "offer";
  setActiveTab: (tab: "create" | "offer") => void;

  offerTab: "create" | "fill" | "claim";
  setOfferTab: (tab: "create" | "fill" | "claim") => void;

  marketHash: string;
  setMarketHash: (hash: string) => void;

  pkpPublicKey: string;
  setPkpPublicKey: (pkpPublicKey: string) => void;

  ipfsHash: string;
  setIpfsHash: (ipfsHash: string) => void;

  oanSigningAddress: string;
  setOanSigningAddress: (oanSigningAddress: string) => void;

  offerCreatedHash: string;
  setOfferCreatedHash: (offerCreatedHash: string) => void;

  offerFilledHash: string;
  setOfferFilledHash: (offerFilledHash: string) => void;
}

export const useMarket = create<UseMarketState>((set) => ({
  activeTab: "create",
  setActiveTab: (tab) => set({ activeTab: tab }),

  offerTab: "create",
  setOfferTab: (tab) => set({ offerTab: tab }),

  marketHash:
    "0x05d7765cd3f1a853f8f9054b5e7c1787a4de55edcbf37e6a8cabcdb17b6b949e",
  setMarketHash: (hash) => set({ marketHash: hash }),

  pkpPublicKey:
    "0x04cabbf7180f3f3fde1cfa09a9b7635b0bfb17f703ccf293cdf01891fc9497678c0c0c4d0bf75152bfa38c0ff797f3372fb964892a95d09d87d1fe1f7312f9c507",
  setPkpPublicKey: (pkpPublicKey) => set({ pkpPublicKey }),

  ipfsHash: "",
  setIpfsHash: (ipfsHash) => set({ ipfsHash }),

  oanSigningAddress: "",
  setOanSigningAddress: (oanSigningAddress) => set({ oanSigningAddress }),

  offerCreatedHash:
    "0x05d7765cd3f1a853f8f9054b5e7c1787a4de55edcbf37e6a8cabcdb17b6b949e",
  setOfferCreatedHash: (offerCreatedHash) => set({ offerCreatedHash }),

  offerFilledHash: "",
  setOfferFilledHash: (offerFilledHash) => set({ offerFilledHash }),
}));

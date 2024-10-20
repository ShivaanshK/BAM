import { create } from "zustand";

interface UseMarketState {
  activeTab: "create" | "offer";
  setActiveTab: (tab: "create" | "offer") => void;

  offerTab: "create" | "fill";
  setOfferTab: (tab: "create" | "fill") => void;

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

  marketHash: "",
  setMarketHash: (hash) => set({ marketHash: hash }),

  pkpPublicKey: "",
  setPkpPublicKey: (pkpPublicKey) => set({ pkpPublicKey }),

  ipfsHash: "",
  setIpfsHash: (ipfsHash) => set({ ipfsHash }),

  oanSigningAddress: "",
  setOanSigningAddress: (oanSigningAddress) => set({ oanSigningAddress }),

  offerCreatedHash: "",
  setOfferCreatedHash: (offerCreatedHash) => set({ offerCreatedHash }),

  offerFilledHash: "",
  setOfferFilledHash: (offerFilledHash) => set({ offerFilledHash }),
}));

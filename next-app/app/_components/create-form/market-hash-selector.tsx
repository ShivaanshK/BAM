"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createFormSchema } from "./create-form";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import React from "react";
import { Input } from "@/components/ui/input";
import { useAccount } from "wagmi";
import { shortAddress } from "@/components/utils";
import { Button } from "@/components/ui/button";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useMarket } from "@/store";

export const MarketHashSelector = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const { marketHash, setMarketHash } = useMarket();

  return (
    <Input
      className="bg-white mt-2"
      onChange={(e) => setMarketHash(e.target.value)}
      value={marketHash}
      placeholder={"Enter Market Hash"}
    />
  );
});

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

export const WalletConnector = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    createForm: UseFormReturn<z.infer<typeof createFormSchema>>;
  }
>(({ className, createForm, ...props }, ref) => {
  const { isConnected, address } = useAccount();
  const { open, close } = useWeb3Modal();

  return (
    <FormItem>
      <FormLabel>Wallet Address</FormLabel>
      <FormControl>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            disabled={true}
            placeholder={
              address ? shortAddress(address) : "Wallet Not Connected"
            }
          />
          <Button
            onClick={() => {
              open();
            }}
            className="w-36 min-w-36"
            type="button"
          >
            {isConnected ? "Open Wallet" : "Connect Wallet"}
          </Button>
        </div>
      </FormControl>
      <FormDescription>This is the signing address.</FormDescription>
      <FormMessage />
    </FormItem>
  );
});

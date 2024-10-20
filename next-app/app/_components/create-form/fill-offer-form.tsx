"use client";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StakingTokenSelector } from "./staking-token-selector";
import { IpfsContentIdSelector } from "./ipfs-content-id-selector";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { WalletConnector } from "./wallet-connector";
import { ExpirySelector } from "./expiry-selector";
import { IncentiveTokenSelector } from "./incentive-token-selector";
import { IncentiveValueSelector } from "./incentive-value-selector";
import { OfferHashSelector } from "./offer-hash-selector";
import { useMarket } from "@/store";
import { LoadingSpinner } from "@/components/composables";
import { CopyTextViewer } from "./copy-text-viewer";
import { OFFCHAIN_MARKET_HUB } from "@/components/contracts";
import { Address } from "viem";

export const fillOfferFormSchema = z.object({
  offerHash: z.string(),
});

export const FillOfferForm = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { isConnected, address } = useAccount();
  const { open, close } = useWeb3Modal();

  const { offerFilledHash, setOfferFilledHash } = useMarket();

  const fillOfferForm = useForm<z.infer<typeof fillOfferFormSchema>>({
    resolver: zodResolver(fillOfferFormSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof fillOfferFormSchema>) {
    // console.log(values);

    if (!isConnected) {
      open();
    } else {
      console.log("submit form");
    }
  }

  const nextLabel = () => {
    if (!isConnected) {
      return "Connect Wallet";
    } else {
      return "Create Market";
    }
  };

  const {
    writeContract,
    writeContractAsync,
    data: txHash,
  } = useWriteContract();

  const {
    data: txData,
    isLoading: isTxConfirming,
    isSuccess: isTxConfirmed,
    status: txStatus,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (txData && txData.logs[0].topics[2]) {
      setOfferFilledHash(txData.logs[0].topics[2]);
    }
  }, [txData]);

  return (
    <div ref={ref} {...props} className={cn("w-full", className)}>
      <Form {...fillOfferForm}>
        <form
          onSubmit={fillOfferForm.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <OfferHashSelector fillOfferForm={fillOfferForm} />

          <Button
            onClick={async () => {
              try {
                await writeContractAsync({
                  address: OFFCHAIN_MARKET_HUB.address as Address,
                  abi: OFFCHAIN_MARKET_HUB.abi,
                  functionName: "fillIPOffer",
                  args: [
                    fillOfferForm.watch("offerHash"),
                    "0x0000000000000000000000000000000000000000",
                    "0x77777Cc68b333a2256B436D675E8D257699Aa667",
                  ],
                });
              } catch (error) {
                console.log("error filling offer", error);
              }
            }}
            disabled={!isConnected ? true : false}
            className="w-full"
            type="submit"
          >
            {isTxConfirming ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              "Fill Offer"
            )}{" "}
          </Button>
        </form>

        <CopyTextViewer className="mt-2" value={offerFilledHash} />
      </Form>
    </div>
  );
});

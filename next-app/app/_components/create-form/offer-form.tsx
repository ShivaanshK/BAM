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
import { StakeValueSelector } from "./stake-value-selector";
import { useMarket } from "@/store";
import { OFFCHAIN_MARKET_HUB } from "@/components/contracts";
import { Address } from "viem";
import { TweetValueSelector } from "./tweet-value-selector";
import { FollowerValueSelector } from "./follower-value-selector";
import { BigNumber, ethers } from "ethers";
import { LoadingSpinner } from "@/components/composables";
import { CopyTextViewer } from "./copy-text-viewer";

export const offerFormSchema = z.object({
  expiry: z.date(),
  stakeValue: z.string(),
  incentiveToken: z.string(),
  incentiveValue: z.string(),
  tweetValue: z.string(),
  followerValue: z.string(),
});

export const OfferForm = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { isConnected, address } = useAccount();
  const { open, close } = useWeb3Modal();

  const { offerCreatedHash, setOfferCreatedHash, marketHash } = useMarket();

  const offerForm = useForm<z.infer<typeof offerFormSchema>>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof offerFormSchema>) {
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
    if (txData && txData.logs[1].topics[2]) {
      setOfferCreatedHash(txData.logs[1].topics[2]);
    }
  }, [txData]);

  console.log("txData", txData);

  return (
    <div ref={ref} {...props} className={cn("w-full", className)}>
      <Form {...offerForm}>
        <form onSubmit={offerForm.handleSubmit(onSubmit)} className="space-y-8">
          <FollowerValueSelector className="w-full" offerForm={offerForm} />
          <TweetValueSelector className="w-full" offerForm={offerForm} />

          <StakeValueSelector className="w-full" offerForm={offerForm} />
          <IncentiveTokenSelector className="w-full" offerForm={offerForm} />
          <IncentiveValueSelector className="w-full" offerForm={offerForm} />

          <ExpirySelector className="w-full" offerForm={offerForm} />

          <Button
            onClick={async () => {
              try {
                await writeContractAsync({
                  address: OFFCHAIN_MARKET_HUB.address as Address,
                  abi: OFFCHAIN_MARKET_HUB.abi,
                  functionName: "createIPOffer",
                  args: [
                    marketHash,
                    BigNumber.from(offerForm.watch("stakeValue"))
                      .mul(BigNumber.from(10).pow(18))
                      .toString(),
                    ethers.utils.defaultAbiCoder.encode(
                      ["uint256", "string"],
                      [
                        offerForm.watch("followerValue"),
                        offerForm.watch("tweetValue"),
                      ]
                    ),
                    Math.floor(offerForm.watch("expiry").getTime() / 1000),
                    Math.floor(offerForm.watch("expiry").getTime() / 1000),
                    [offerForm.watch("incentiveToken")],
                    [
                      BigNumber.from(offerForm.watch("incentiveValue"))
                        .mul(BigNumber.from(10).pow(18))
                        .toString(),
                    ],
                  ],
                });
              } catch (error) {
                console.log("error creating offer", error);
              }
            }}
            disabled={!isConnected ? true : false}
            className="w-full"
            type="submit"
          >
            {isTxConfirming ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              "Make Offer"
            )}{" "}
          </Button>
        </form>

        <CopyTextViewer className="mt-2" value={offerCreatedHash} />
      </Form>
    </div>
  );
});

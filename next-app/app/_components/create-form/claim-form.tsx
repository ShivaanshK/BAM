"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { StakingTokenSelector } from "./staking-token-selector";
import { IpfsContentIdSelector } from "./ipfs-content-id-selector";
import { useAccount, useWriteContract } from "wagmi";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { WalletConnector } from "./wallet-connector";
import { useWalletClient } from "wagmi";
import { getLitNodeClient, getSessionSigs, mintPkp } from "./create-utils";
import { useWaitForTransactionReceipt } from "wagmi";

import type { Account, Address, Chain, Client, Transport } from "viem";
import { Config, useConnectorClient } from "wagmi";
import { ethers, providers } from "ethers";
import { useMarket } from "@/store";
import { OFFCHAIN_MARKET_HUB } from "@/components/contracts";

import { useSwitchChain } from "wagmi";

import { config } from "@/components/web3-modal/modal-config";
import { LoadingSpinner } from "@/components/composables";
import { CopyTextViewer } from "./copy-text-viewer";
import { TweetUrlValueSelector } from "./tweet-url-value-selector";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { litActionCode } from "./litAction";

// Convert wagmi client to ethers signer
export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

// Custom hook to get ethers signer
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

export const claimFormSchema = z.object({
  tweetUrl: z.string(),
});

export const ClaimForm = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { isConnected, address } = useAccount();
  const { open, close } = useWeb3Modal();
  const { data: wagmiSigner } = useWalletClient();
  const ethersSigner = useEthersSigner();

  const { selectedNetworkId } = useWeb3ModalState();

  const { switchChain, switchChainAsync } = useSwitchChain();

  const { data: walletClient } = useWalletClient();

  const {
    pkpPublicKey,
    setPkpPublicKey,
    ipfsHash,
    setIpfsHash,
    setOanSigningAddress,
    oanSigningAddress,
    setMarketHash,
    marketHash,
    offerCreatedHash,
    setOfferCreatedHash,
  } = useMarket();

  const claimForm = useForm<z.infer<typeof claimFormSchema>>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      tweetUrl: "",
    },
  });

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
      setMarketHash(txData.logs[0].topics[2]);
    }
  }, [txData]);

  function onSubmit(values: z.infer<typeof claimFormSchema>) {
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

  return (
    <div ref={ref} {...props} className={cn("", className)}>
      <Form {...claimForm}>
        <form onSubmit={claimForm.handleSubmit(onSubmit)} className="space-y-8">
          <TweetUrlValueSelector claimForm={claimForm} />

          <Button
            onClick={async () => {
              try {
                const tweetId = claimForm.watch("tweetUrl").split("/")[5];

                const litNodeClient = await getLitNodeClient();

                const accessControlConditions = [
                  {
                    contractAddress: "",
                    standardContractType: "",
                    chain: "sepolia",
                    method: "",
                    parameters: [":currentActionIpfsId"],
                    returnValueTest: {
                      comparator: "=",
                      value: ipfsHash,
                    },
                  },
                ];

                const sessionSigs = await getSessionSigs(
                  litNodeClient,
                  ethersSigner
                );

                const { ciphertext, dataToEncryptHash } =
                  await LitJsSdk.encryptString(
                    {
                      accessControlConditions,
                      // @ts-ignore
                      chain: "sepolia",
                      dataToEncrypt: tweetId,
                    },
                    litNodeClient
                  );

                console.log("ciphertext", ciphertext);
                console.log("dataToEncryptHash", dataToEncryptHash);

                const litActionSignatures = await litNodeClient.executeJs({
                  sessionSigs,
                  code: litActionCode,
                  jsParams: {
                    contractAddress: OFFCHAIN_MARKET_HUB.address,
                    offerType: "IP",
                    offerHash: offerCreatedHash,
                    accessControlConditions,
                    ciphertext,
                    dataToEncryptHash,
                    chain: 11155111,
                    publicKey: pkpPublicKey,
                    sigName: `sig`,
                  },
                });

                console.log("litActionSignatures", litActionSignatures);

                console.log("marketHash", marketHash);
                console.log("offerHash", offerCreatedHash);

                await writeContractAsync({
                  address: OFFCHAIN_MARKET_HUB.address as Address,
                  abi: OFFCHAIN_MARKET_HUB.abi,
                  functionName: "claim",
                  args: [
                    marketHash,
                    offerCreatedHash,
                    true,
                    litActionSignatures.signatures.sig.signature,
                  ],
                });
              } catch (error) {
                console.log("error claiming offer", error);
              }
            }}
            disabled={!isConnected ? true : false}
            className="w-full"
            type="submit"
          >
            {isTxConfirming ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              "Claim Offer"
            )}
          </Button>
        </form>
        <CopyTextViewer className="mt-2" value={txHash} />
      </Form>
    </div>
  );
});

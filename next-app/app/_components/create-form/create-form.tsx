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

export const createFormSchema = z.object({
  stakingToken: z.string(),
  ipfsContentID: z.string(),
  oanSigningAddress: z.string(),
});

export const CreateForm = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { isConnected, address } = useAccount();
  const { open, close } = useWeb3Modal();
  const { data: wagmiSigner } = useWalletClient();
  const ethersSigner = useEthersSigner();

  const { selectedNetworkId } = useWeb3ModalState();

  const { switchChain, switchChainAsync } = useSwitchChain();
  // const { switchNetwork } = useSwitchNetwork();

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
  } = useMarket();

  const createForm = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      stakingToken: "0x3c727dd5ea4c55b7b9a85ea2f287c641481400f7",
      ipfsContentID: "",
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

  function onSubmit(values: z.infer<typeof createFormSchema>) {
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
      <Form {...createForm}>
        <form
          onSubmit={createForm.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <StakingTokenSelector createForm={createForm} />
          <IpfsContentIdSelector createForm={createForm} />
          <WalletConnector createForm={createForm} />

          <Button
            onClick={async () => {
              try {
                // @ts-ignore
                if (selectedNetworkId !== 175188) {
                  await switchChainAsync({
                    chainId: 175188,
                  });
                }

                const litNodeClient = await getLitNodeClient();

                const sessionSigs = await getSessionSigs(
                  litNodeClient,
                  ethersSigner
                );

                const data = await mintPkp(ethersSigner);

                setPkpPublicKey(data.pkpPublicKey);
                setIpfsHash(data.ipfsHash);
                setOanSigningAddress(data.oanSigningAddress);

                //  switchChain({
                //   chainId: 11155111,
                // });

                walletClient?.switchChain({
                  id: 11155111,
                });

                // console.log("data ipfs hash", data.ipfsHash);
                // console.log("length", data.ipfsHash.length);

                setTimeout(async () => {
                  await writeContractAsync({
                    address: OFFCHAIN_MARKET_HUB.address as Address,
                    abi: OFFCHAIN_MARKET_HUB.abi,
                    functionName: "createMarket",
                    args: [
                      createForm.watch("stakingToken"),
                      "10000000000000000",
                      ethers.utils.hexlify(
                        ethers.utils.toUtf8Bytes(data.ipfsHash)
                      ),
                      data.oanSigningAddress,
                    ],
                  });
                }, 5000);
              } catch (error) {
                console.log("error creating market", error);
              }
            }}
            disabled={!isConnected ? true : false}
            className="w-full"
            type="submit"
          >
            {isTxConfirming ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              "Create Market"
            )}
          </Button>
        </form>
        <CopyTextViewer className="mt-2" value={marketHash} />
      </Form>
    </div>
  );
});

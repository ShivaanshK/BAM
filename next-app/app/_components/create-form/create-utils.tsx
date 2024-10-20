import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  AuthMethodScope,
  LitNetwork,
  AuthMethodType,
} from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { disconnectWeb3 } from "@lit-protocol/auth-browser";
import * as ethers from "ethers";
import { litActionCode } from "./litAction";
import Hash from "ipfs-only-hash";

export async function getLitNodeClient() {
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
  });

  console.log("Connecting litNodeClient to network...");
  await litNodeClient.connect();

  console.log("litNodeClient connected!");
  return litNodeClient;
}

export async function getPkpPublicKey(ethersSigner: any) {
  if (
    process.env.PKP_PUBLIC_KEY !== undefined &&
    process.env.PKP_PUBLIC_KEY !== ""
  )
    return process.env.PKP_PUBLIC_KEY;

  const pkp = await mintPkp(ethersSigner);
  console.log("Minted PKP!", pkp);
  return pkp.publicKey;
}

export async function mintPkp(ethersSigner: any) {
  console.log("Minting new PKP...");

  const litContracts = new LitContracts({
    signer: ethersSigner,
    network: LitNetwork.DatilDev,
  });

  await litContracts.connect();

  const ipfsHash = await stringToIpfsHash(litActionCode);

  const txn =
    await litContracts.pkpHelperContract.write.mintNextAndAddAuthMethods(
      2,
      [AuthMethodType.LitAction],
      [ethers.utils.base58.decode(ipfsHash)],
      ["0x"],
      [[AuthMethodScope.SignAnything, AuthMethodScope.PersonalSign]],
      false,
      true,
      { value: 1, gasLimit: 4000000000 }
    );

  const receipt = await txn.wait();
  console.log("Minted!", receipt);

  console.log(receipt.pkp);

  // get the pkp public key from the mint event
  const pkpId = receipt.logs[0].topics[1];
  const pkpInfo = await litContracts.pubkeyRouterContract.read.pubkeys(
    ethers.BigNumber.from(pkpId)
  );
  console.log("PKP Info:", pkpInfo);
  const pkpPublicKey = pkpInfo.pubkey;

  console.log("PKP Address:", ethers.utils.computeAddress(pkpPublicKey));

  console.log("PKP Public Key:", pkpPublicKey);

  return {
    oanSigningAddress: ethers.utils.computeAddress(pkpPublicKey),
    ipfsHash: ipfsHash,
    pkpPublicKey: pkpPublicKey.slice(2),
  };
}

export async function getSessionSigs(litNodeClient: any, ethersSigner: any) {
  console.log("Getting Session Signatures...");
  return litNodeClient.getSessionSigs({
    chain: "sepolia",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
      {
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
    ],
    authNeededCallback: getAuthNeededCallback(litNodeClient, ethersSigner),
  });
}

export function getAuthNeededCallback(litNodeClient, ethersSigner) {
  return async ({ resourceAbilityRequests, expiration, uri }) => {
    const toSign = await createSiweMessageWithRecaps({
      uri,
      expiration,
      resources: resourceAbilityRequests,
      walletAddress: await ethersSigner.getAddress(),
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    const authSig = await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });

    return authSig;
  };
}

export function stringToIpfsHash(input: any) {
  return Hash.of(input);
}

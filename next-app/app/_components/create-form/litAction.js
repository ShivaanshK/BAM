// export const litActionCode = `
// (async () => {
//   // Updated fetch request with x-www-form-urlencoded body
//   const tweetUrl = "https://bam-backend-five.vercel.app/api/checkTweet";
//   const tweetResponse = await fetch(tweetUrl, {
//     method: 'POST',
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded"
//     },
//     body: new URLSearchParams({
//       tweetid: tweetId
//     })
//   }).then(response => response.json());

//   if (tweetResponse.followerCount < followerCountThreshold) {
//     return;
//   }

//   const abi = [
//     "function checkTweet(string tweetId) public view returns (bool)"
//   ];

//   // Convert an empty string to bytes and hash it
//   let toSign = ethers.utils.arrayify(
//     ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tweetId))
//   );

//   // Sign the empty message
//   const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });

//   // Publish or handle the signature as needed
//   console.log(sigShare);
// })();
// `;

export const litActionCode = `
(async () => {
  const ABI = [{ "type": "constructor", "inputs": [{ "name": "_protocolFee", "type": "uint256", "internalType": "uint256" }, { "name": "_minimumFrontendFee", "type": "uint256", "internalType": "uint256" }, { "name": "_owner", "type": "address", "internalType": "address" }, { "name": "_pointsFactory", "type": "address", "internalType": "address" }], "stateMutability": "payable" }, { "type": "function", "name": "POINTS_FACTORY", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "cancelAPOffer", "inputs": [{ "name": "offerHash", "type": "bytes32", "internalType": "bytes32" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "cancelIPOffer", "inputs": [{ "name": "offerHash", "type": "bytes32", "internalType": "bytes32" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "claim", "inputs": [{ "name": "marketHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "offerHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "wasIPOffer", "type": "bool", "internalType": "bool" }, { "name": "oanSignature", "type": "bytes", "internalType": "bytes" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "claimFees", "inputs": [{ "name": "incentiveToken", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "createAPOffer", "inputs": [{ "name": "targetMarketHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "expiry", "type": "uint256", "internalType": "uint256" }, { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" }, { "name": "fundingVault", "type": "address", "internalType": "address" }, { "name": "timeToAct", "type": "uint256", "internalType": "uint256" }, { "name": "verificationScriptParams", "type": "bytes", "internalType": "bytes" }, { "name": "incentivesRequested", "type": "address[]", "internalType": "address[]" }, { "name": "incentiveAmountsRequested", "type": "uint256[]", "internalType": "uint256[]" }], "outputs": [{ "name": "offerHash", "type": "bytes32", "internalType": "bytes32" }], "stateMutability": "payable" }, { "type": "function", "name": "createIPOffer", "inputs": [{ "name": "targetMarketHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" }, { "name": "verificationScriptParams", "type": "bytes", "internalType": "bytes" }, { "name": "expiry", "type": "uint256", "internalType": "uint256" }, { "name": "timeToAct", "type": "uint256", "internalType": "uint256" }, { "name": "incentivesOffered", "type": "address[]", "internalType": "address[]" }, { "name": "incentiveAmountsPaid", "type": "uint256[]", "internalType": "uint256[]" }], "outputs": [{ "name": "offerHash", "type": "bytes32", "internalType": "bytes32" }], "stateMutability": "payable" }, { "type": "function", "name": "createMarket", "inputs": [{ "name": "stakingToken", "type": "address", "internalType": "contract ERC20" }, { "name": "frontendFee", "type": "uint256", "internalType": "uint256" }, { "name": "ipfsContentID", "type": "bytes32", "internalType": "bytes32" }, { "name": "oanSigningAddress", "type": "address", "internalType": "address" }], "outputs": [{ "name": "marketHash", "type": "bytes32", "internalType": "bytes32" }], "stateMutability": "payable" }, { "type": "function", "name": "feeClaimantToTokenToAmount", "inputs": [{ "name": "", "type": "address", "internalType": "address" }, { "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "fillAPOffer", "inputs": [{ "name": "offerHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "frontendFeeRecipient", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "fillIPOffer", "inputs": [{ "name": "offerHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "fundingVault", "type": "address", "internalType": "address" }, { "name": "frontendFeeRecipient", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "getAPOfferHash", "inputs": [{ "name": "offerID", "type": "uint256", "internalType": "uint256" }, { "name": "targetMarketHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "ap", "type": "address", "internalType": "address" }, { "name": "expiry", "type": "uint256", "internalType": "uint256" }, { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" }, { "name": "verificationScriptParams", "type": "bytes", "internalType": "bytes" }, { "name": "incentivesRequested", "type": "address[]", "internalType": "address[]" }, { "name": "incentiveAmountsRequested", "type": "uint256[]", "internalType": "uint256[]" }], "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }], "stateMutability": "pure" }, { "type": "function", "name": "getIPOfferHash", "inputs": [{ "name": "offerID", "type": "uint256", "internalType": "uint256" }, { "name": "targetMarketHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "ip", "type": "address", "internalType": "address" }, { "name": "expiry", "type": "uint256", "internalType": "uint256" }, { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" }, { "name": "verificationScriptParams", "type": "bytes", "internalType": "bytes" }, { "name": "incentivesOffered", "type": "address[]", "internalType": "address[]" }, { "name": "incentiveAmountsOffered", "type": "uint256[]", "internalType": "uint256[]" }], "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }], "stateMutability": "pure" }, { "type": "function", "name": "getMarketHash", "inputs": [{ "name": "market", "type": "tuple", "internalType": "struct OffchainActionMarketHub.OffchainActionMarket", "components": [{ "name": "stakingToken", "type": "address", "internalType": "contract ERC20" }, { "name": "marketID", "type": "uint256", "internalType": "uint256" }, { "name": "frontendFee", "type": "uint256", "internalType": "uint256" }, { "name": "ipfsContentID", "type": "bytes32", "internalType": "bytes32" }, { "name": "oanSigningAddress", "type": "address", "internalType": "address" }] }], "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }], "stateMutability": "pure" }, { "type": "function", "name": "marketHashToOffchainActionMarket", "inputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }], "outputs": [{ "name": "stakingToken", "type": "address", "internalType": "contract ERC20" }, { "name": "marketID", "type": "uint256", "internalType": "uint256" }, { "name": "frontendFee", "type": "uint256", "internalType": "uint256" }, { "name": "ipfsContentID", "type": "bytes32", "internalType": "bytes32" }, { "name": "oanSigningAddress", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "minimumFrontendFee", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "numAPOffers", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "numIPOffers", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "numMarkets", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "offerHashToAPOffer", "inputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }], "outputs": [{ "name": "offerID", "type": "uint256", "internalType": "uint256" }, { "name": "targetMarketHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "fundingVault", "type": "address", "internalType": "address" }, { "name": "ap", "type": "address", "internalType": "address" }, { "name": "ipFiller", "type": "address", "internalType": "address" }, { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" }, { "name": "verificationScriptParams", "type": "bytes", "internalType": "bytes" }, { "name": "expiry", "type": "uint256", "internalType": "uint256" }, { "name": "timeToAct", "type": "uint256", "internalType": "uint256" }, { "name": "dueDate", "type": "uint256", "internalType": "uint256" }, { "name": "frontendFeeRecipient", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "offerHashToIPOffer", "inputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }], "outputs": [{ "name": "offerID", "type": "uint256", "internalType": "uint256" }, { "name": "targetMarketHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "ip", "type": "address", "internalType": "address" }, { "name": "apFiller", "type": "address", "internalType": "address" }, { "name": "stakeAmount", "type": "uint256", "internalType": "uint256" }, { "name": "verificationScriptParams", "type": "bytes", "internalType": "bytes" }, { "name": "expiry", "type": "uint256", "internalType": "uint256" }, { "name": "timeToAct", "type": "uint256", "internalType": "uint256" }, { "name": "dueDate", "type": "uint256", "internalType": "uint256" }, { "name": "frontendFeeRecipient", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "protocolFee", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "protocolFeeClaimant", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "setMinimumFrontendFee", "inputs": [{ "name": "_minimumFrontendFee", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "setOffersPaused", "inputs": [{ "name": "_offersPaused", "type": "bool", "internalType": "bool" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setProtocolFee", "inputs": [{ "name": "_protocolFee", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "setProtocolFeeClaimant", "inputs": [{ "name": "_protocolFeeClaimant", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "transferOwnership", "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "event", "name": "APOfferCancelled", "inputs": [{ "name": "offerID", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "APOfferCreated", "inputs": [{ "name": "offerID", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "offerHash", "type": "bytes32", "indexed": true, "internalType": "bytes32" }, { "name": "marketHash", "type": "bytes32", "indexed": true, "internalType": "bytes32" }, { "name": "fundingVault", "type": "address", "indexed": false, "internalType": "address" }, { "name": "verificationScriptParams", "type": "bytes", "indexed": false, "internalType": "bytes" }, { "name": "stakeAmount", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "timeToAct", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "incentiveAddresses", "type": "address[]", "indexed": false, "internalType": "address[]" }, { "name": "incentiveAmounts", "type": "uint256[]", "indexed": false, "internalType": "uint256[]" }, { "name": "expiry", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "APOfferFilled", "inputs": [{ "name": "offerID", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "ip", "type": "address", "indexed": true, "internalType": "address" }, { "name": "dueDate", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "incentiveAmounts", "type": "uint256[]", "indexed": false, "internalType": "uint256[]" }, { "name": "protocolFeeAmounts", "type": "uint256[]", "indexed": false, "internalType": "uint256[]" }, { "name": "frontendFeeAmounts", "type": "uint256[]", "indexed": false, "internalType": "uint256[]" }], "anonymous": false }, { "type": "event", "name": "ClaimedIncentive", "inputs": [{ "name": "ap", "type": "address", "indexed": true, "internalType": "address" }, { "name": "incentive", "type": "address", "indexed": false, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "FeesClaimed", "inputs": [{ "name": "claimant", "type": "address", "indexed": true, "internalType": "address" }, { "name": "incentive", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "IPOfferCancelled", "inputs": [{ "name": "offerHash", "type": "bytes32", "indexed": true, "internalType": "bytes32" }], "anonymous": false }, { "type": "event", "name": "IPOfferCreated", "inputs": [{ "name": "offerID", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "offerHash", "type": "bytes32", "indexed": true, "internalType": "bytes32" }, { "name": "marketHash", "type": "bytes32", "indexed": true, "internalType": "bytes32" }, { "name": "verificationScriptParams", "type": "bytes", "indexed": false, "internalType": "bytes" }, { "name": "stakeAmount", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "timeToAct", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "incentivesOffered", "type": "address[]", "indexed": false, "internalType": "address[]" }, { "name": "incentiveAmounts", "type": "uint256[]", "indexed": false, "internalType": "uint256[]" }, { "name": "protocolFeeAmounts", "type": "uint256[]", "indexed": false, "internalType": "uint256[]" }, { "name": "frontendFeeAmounts", "type": "uint256[]", "indexed": false, "internalType": "uint256[]" }, { "name": "expiry", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "IPOfferFilled", "inputs": [{ "name": "offerHash", "type": "bytes32", "indexed": true, "internalType": "bytes32" }, { "name": "ap", "type": "address", "indexed": true, "internalType": "address" }, { "name": "dueDate", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "MarketCreated", "inputs": [{ "name": "marketID", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "marketHash", "type": "bytes32", "indexed": true, "internalType": "bytes32" }, { "name": "frontendFee", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "ipfsContentID", "type": "bytes32", "indexed": false, "internalType": "bytes32" }, { "name": "oanSigningAddress", "type": "address", "indexed": false, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "OwnershipTransferred", "inputs": [{ "name": "user", "type": "address", "indexed": true, "internalType": "address" }, { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false }, { "type": "error", "name": "ArrayLengthMismatch", "inputs": [] }, { "type": "error", "name": "CannotFillZeroQuantityOffer", "inputs": [] }, { "type": "error", "name": "CannotPlaceExpiredOffer", "inputs": [] }, { "type": "error", "name": "CannotPlaceZeroQuantityOffer", "inputs": [] }, { "type": "error", "name": "FrontendFeeTooLow", "inputs": [] }, { "type": "error", "name": "InvalidMarketInputToken", "inputs": [] }, { "type": "error", "name": "InvalidOanSignature", "inputs": [] }, { "type": "error", "name": "InvalidPointsProgram", "inputs": [] }, { "type": "error", "name": "MarketDoesNotExist", "inputs": [] }, { "type": "error", "name": "MismatchedBaseAsset", "inputs": [] }, { "type": "error", "name": "NoIncentivesPaidOnFill", "inputs": [] }, { "type": "error", "name": "NotOwner", "inputs": [] }, { "type": "error", "name": "OfferAlreadyFilled", "inputs": [] }, { "type": "error", "name": "OfferCannotContainDuplicates", "inputs": [] }, { "type": "error", "name": "OfferExpired", "inputs": [] }, { "type": "error", "name": "OffersPaused", "inputs": [] }, { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] }, { "type": "error", "name": "StakingFailed", "inputs": [] }, { "type": "error", "name": "TokenDoesNotExist", "inputs": [] }, { "type": "error", "name": "TotalFeeTooHigh", "inputs": [] }, { "type": "error", "name": "WalletLocked", "inputs": [] }]

  // Fetch the tweet (offchain action) to check if it satisfies the offer
  try {
    // Updated fetch request with x-www-form-urlencoded body
    const bamTwitterApi = "https://bam-backend-five.vercel.app/api/checkTweet";

    // Tweet ID is encrypted so no one knows exactly which tweet qualified
    const tweetid = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig: null,
      chain,
    });

    const tweetResponse = await fetch(bamTwitterApi, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        tweetid
      })
    }).then(response => response.json());

    console.log(tweetResponse)


    const rpcUrl = "https://sepolia.gateway.tenderly.co	"

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const contract = new ethers.Contract(contractAddress, ABI, provider);
    let offer;
    let verificationScriptParams;
    let expectedMinFollowerCount;
    let expectedTweetText;

    if (offerType == "IP") {
      offer = await contract.offerHashToIPOffer(offerHash);
    } else if (offerType == "AP") {
      offer = await contract.offerHashToAPOffer(offerHash);
    } else {
      LitActions.setResponse({ response: "Invalid offer type" });
      return;
    }

    // Extract verificationScriptParams
    verificationScriptParams = offer.verificationScriptParams;

    // Decode verificationScriptParams
    const decodedParams = ethers.utils.defaultAbiCoder.decode(["uint256", "string"], verificationScriptParams);

    expectedMinFollowerCount = decodedParams[0].toNumber();
    expectedTweetText = decodedParams[1];

    // Now we have expectedMinFollowerCount and expectedTweetText
    // Compare the follower count from the tweet text to verify action
    if (tweetResponse.followerCount < expectedMinFollowerCount || tweetResponse.text != expectedTweetText) {
      LitActions.setResponse({ response: "Action does not meet the offer's requirements", 
      expectedTweetText: expectedTweetText,
      expectedMinFollowerCount: expectedMinFollowerCount,
      
      });
      return;
    }

    console.log('Offer verificationScriptParams:', {
      dueDate: offer.dueDate.toString(),
      verificationScriptParams: verificationScriptParams,
      expectedMinFollowerCount,
      expectedTweetText
    });

    // Sign the offerhash for claiming onchain
    let toSign = ethers.utils.arrayify(
      offerHash
    );

    // Sign the message using LitActions
    const signature = await LitActions.signEcdsa({ toSign, publicKey, sigName });

    LitActions.setResponse({ response: { offerHash, signature } });
  } catch (error) {
    LitActions.setResponse({ response: error.message });
    return;
  }
})();
`;

const litActionCode = async () => {
  const ABI = 
  // Updated fetch request with x-www-form-urlencoded body
  const tweetUrl = "https://bam-backend-five.vercel.app/api/checkTweet";
  const tweetResponse = await fetch(tweetUrl, {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      tweetid: "1847143637345530235"
    })
  }).then(response => response.json());

  console.log(tweetResponse)

  const rpcUrl = "https://sepolia.gateway.tenderly.co	"
  const contractAddress = "0xcFF39356EDe9145F9b7DDbCCf43957BF057627a3"
  let scriptParams

  if (offerType == "IP") {
    ethers.utils.defaultAbiCoder.decode(["uint256", "string"], data);

  } else if (offerType == "AP") {

  } else {
    return;
  }

  if (tweetResponse.followerCount < followerCountThreshold) {
    return;
  }

  const abi = [
    "function checkTweet(string tweetId) public view returns (bool)"
  ];

  // Convert an empty string to bytes and hash it
  let toSign = ethers.utils.arrayify(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(tweetId))
  );

  // Sign the empty message
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });

  // Publish or handle the signature as needed
  console.log(sigShare);
};

litActionCode();

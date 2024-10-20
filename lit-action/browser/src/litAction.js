export const litActionCode = `
(async () => {
  // Updated fetch request with x-www-form-urlencoded body
  const tweetUrl = "https://bam-backend-five.vercel.app/api/checkTweet";
  const tweetResponse = await fetch(tweetUrl, {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      tweetid: tweetId
    })
  }).then(response => response.json());

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
})();
`;

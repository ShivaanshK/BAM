export const litActionCode = `
(async () => {
  console.log(tweetId, followerCountThreshold, publicKey, sigName);
  
  // Fetch request equivalent to the curl command
  const tweetUrl = "https://api.twitter.com/2/tweets?ids=" + tweetId + "&expansions=author_id";
  const tweetResponse = await fetch(tweetUrl, {
    headers: {
      "Authorization": 'Bearer BEARER_TOKEN'
    }
  }).then(response => response.json());

  console.log(tweetResponse.includes.users[0].username);

  const userUrl = "https://api.twitter.com/2/users/by/username/" + tweetResponse.includes.users[0].username + "?user.fields=public_metrics";
  const userResponse = await fetch(userUrl, {
    headers: {
      "Authorization": 'Bearer BEARER_TOKEN'
    }
  }).then(response => response.json());

  console.log(userResponse.data.public_metrics.followers_count);

  if (userResponse.data.public_metrics.followers_count < followerCountThreshold) {
    return;
  }
  
  // Convert an empty string to bytes and hash it
  let toSign = ethers.utils.arrayify(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
  );

  // Sign the empty message
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });

  // Publish or handle the signature as needed
  console.log(sigShare);
})();
`;

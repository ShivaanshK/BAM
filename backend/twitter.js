tweetCache={}
token=''
async function checkTweet(tweetId=""){

    console.log(tweetId)
    if(tweetId=="") throw new Error('Invalid tweetid');
    if(tweetCache.hasOwnProperty(tweetId)) return tweetCache[tweetId]; 

    // Fetch request equivalent to the curl command
    const tweetUrl = "https://api.twitter.com/2/tweets?ids=" + tweetId + "&expansions=author_id";
    const tweetResponse = await fetch(tweetUrl, {
    headers: {
        "Authorization": token
    }
    }).then(response => response.json());
    console.log(tweetResponse)
    console.log(tweetResponse.data[0]);
    console.log(tweetResponse.includes.users[0].username);

    const userUrl = "https://api.twitter.com/2/users/by/username/" + tweetResponse.includes.users[0].username + "?user.fields=public_metrics";
    const userResponse = await fetch(userUrl, {
    headers: {
        "Authorization": token
    }
    }).then(response => response.json());

    console.log(userResponse.data.public_metrics.followers_count);
    tweetData={text: tweetResponse.data[0].text,followerCount:userResponse.data.public_metrics.followers_count,username:tweetResponse.includes.users[0].username}
    tweetCache[tweetId]=tweetData
    console.log(tweetData)
    return tweetData
}

module.exports={checkTweet}


const express = require('express');
const twitterHelpers = require('./twitter')
const url = require('url');

const router = express.Router();

router.get('/checkTweet', async (req, res) => {
  try{
    checkTweetData=await twitterHelpers.checkTweet(req.body.tweetid)
    console.log(checkTweetData)
    res.send(checkTweetData);
    
  }catch (error) {
    // Handle the error
    console.error('Error:', error.message);
    res.send("error")
  }
})

router.get('/products', (req, res) => {
  res.send('Products endpoint');
});

module.exports = router;

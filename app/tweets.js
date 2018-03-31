//app/tweets.js
// Purpose of this file is to make connection to twitter API and get an array of
// tweets.
var Twit      = require('twit');
var authData  = require('./auth');

var client = new Twit({
  consumer_key:         authData.twitterAuth.consumerKey,
  consumer_secret:      authData.twitterAuth.consumerSecret,
  app_only_auth:        true
});

module.exports = {
  getTweets: function(userID, count) {
    var params = {user_id: userID, count: count};
    var arrayOfTweets = [];

    client.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) {
        // Tweets is in the form of an array of objects containing tweet information
        // For example accessing first tweet's text can be done with:
        // >> tweets[0].text
      	for (twiitti of tweets) {
          // Clean up text from mentions, URLs and hashtags.
          arrayOfTweets.push(
            twiitti.replace(/\B@[a-z0-9_-]+/gi,'')               // Remove mentions.
                   .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')   // Remove URLs.
  				         .replace(/#(\S*)/g, '')                       // Remove hashtags.
  				         .replace(/[\ ,:;-]+/g,' '));                  // Remove unnecessary punctions. Preserve
                                                                 // period, question mark and exclamation mark.
      	}
      }
    });
    return arrayOfTweets
  };
};

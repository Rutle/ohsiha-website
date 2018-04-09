'use strict';
// app/tweets.js
// Purpose of this file is to make connection to twitter API and get an array of
// tweets.
var Twit      = require('twit');

var client = new Twit({
  consumer_key:         process.env.TWITTER_CON_KEY,
  consumer_secret:      process.env.TWITTER_CON_SECRET,
  app_only_auth:        true
});

module.exports = {
  // Asynchronous function so that when it is used in routes, the response isn't
  // sent before the data is fetched.
  getTweets: function(userID, count, callback) {
    var params = {user_id: userID, count: count};

    client.get('statuses/user_timeline', params, function(error, tweets, response) {
      var arrayOfTweets = [];
      var twiitti;  // due to 'use strict'

      if (!error) {
        // Tweets is in the form of an array of objects containing tweet information
        // For example accessing first tweet's text can be done with:
        // >> tweets[0].text
      	for (twiitti of tweets) {
          // Clean up text from mentions, URLs and hashtags.
          twiitti = twiitti.text.replace(/\B@[a-z0-9_-]+/gi,'')
								                .replace(/#(\S*)/g, '')
								                .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
								                .replace(/\s\s+/g, ' ')
								                .replace(/[\ ,-]+/g,' ')
								                .split(/[\.:;!?-]+/g).filter(x => x);
          var sent = "";
          for (sent of twiitti) {
            // Skip empty elements in array.
            sent = sent.trim();
            if (sent.length !== 0 ) {
              console.log("Lause tallennettu: ["+sent+"]");
              arrayOfTweets.push(sent);
            }

          }

      	}

      }
      callback(null, arrayOfTweets);
    });
  }
};

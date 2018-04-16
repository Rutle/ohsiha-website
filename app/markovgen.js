'use strict';
const Markov = require('markov-strings');

module.exports = {
  getSentences: function(arrayOfTweets, sentenceCount, callback) {

    // Similar to tweets.
    const options = {
      minWords: 5,
      maxTries: 10,
    };

    let mg = new Markov(arrayOfTweets, options);

    // First time using promises. First it builds corpus. Once it's finished
    // it will generate sentences that will get inserted into the array. Finally
    // it will use the callback function and pass parameters depending on the
    // result.
    mg.buildCorpus()
      .then(() => {

        // Generate some tweets
        const tweets = [];
        for (let i = 0; i < sentenceCount; i++) {
          mg.generateSentence()
            .then(
        		  function(result) {
                tweets.push(result);
        		    console.log(result);
              },
              function(error) {
                //callback("error", null);
        			  console.log("eka: ", error.message);
        		  }
    		    );
        }
    	  return tweets;
      })
      .then(
        function(result) {
    	    console.log("data:", result.length);
          if(result.length === 0) {
            console.log("NODATA");
            callback("NODATA", null);
          } else {
            callback(null, result);
          }
      });
  }
}

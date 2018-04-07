'use strict';
const Markov = require('markov-strings');

module.exports = {
  getSentences: function(arrayOfTweets, sentenceCount, callback) {
    /*
    // Similar to tweets.
    const options = {
      maxLength: 140,
      minWords: 10,
      minScore: 25,
      filter: result => {
        return result.string.endsWith('.');
      }
    };
    */


    let mg = new Markov(arrayOfTweets);

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
            callback("NODATA", null);
          } else {
            callback(null, result);
          }
      });

  }
}

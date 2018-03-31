const Markov = require('libmarkov');

module.exports = {
  getBlogPost: function(arrayOfTweets, sentenceCount) {
    var dataString = "";
    for (tweetString of arrayOfTweets) {
      dataString = dataString + tweetString;
    }

    let markovGen = new Markov(dataString);
    var post = markovGen.generate(sentenceCount);
    return post;
  }
}

// batabase.js
// Database related functions

var mongoose = require('mongoose');
var Article = require('./models/article')
module.exports = {
  getArticles: function (req, callback) {
    Article.find({author: req.user._id}, function (err, articles) {
      if (err) {
        callback(err, null);
      }
      var articlesArray = [];
      for (var i = 0; i < articles.length; i++) {
        var tempA = {};
        tempA.title = articles[i].title;
        if (req.user.twitter.displayName === undefined) {
          if (req.user.local.firstName === undefined &&
              req.user.local.lastName === undefined) {
            tempA.author = "Unknown"
          } else if (req.user.local.firstName === undefined &&
                     req.user.local.lastName !== undefined) {
            tempA.author = req.user.local.lastName
          } else if (req.user.local.firstName !== undefined &&
                     req.user.local.lastName === undefined) {
            tempA.author = req.user.local.firstName
          } else {
            tempA.author = req.user.local.firstName+" "+req.user.local.lastName;
          }
        } else {
          tempA.author = req.user.twitter.displayName;
        }
        tempA.content = articles[i].content;
        new Date().toDateString()
        tempA.dateCreated = new Date().toDateString(articles[i].dateCreated);
        articlesArray.push(tempA);
      }
      callback(null, articlesArray);
    });
  }
}

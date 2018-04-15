'use strict';
// batabase.js
// Database related functions

var mongoose = require('mongoose');
var Article = require('./models/article');
var User = require('./models/user');

module.exports = {
  getArticles: function (req, callback) {
    Article.find({author: req.user._id}, function (err, articles) {
      if (err) {
          callback(err, null);
      }
      User.findOne({'_id': req.user._id}, function(err, user) {
        if(err) {
          callback(err, null);
        }
        var articlesArray = [];
        for (var i = 0; i < articles.length; i++) {
          var tempA = {};
          tempA.title = articles[i].title;
          tempA.author = user.fullName;
          tempA.content = articles[i].content;
          tempA.dateCreated = new Date().toDateString(articles[i].dateCreated);
          tempA.articleId = articles[i].articleId;
          articlesArray.push(tempA);
        }
        callback(null, articlesArray);
      });
    });
  },
  getArticle: function(req, callback) {
    // Using mongoose's populate function that finds a User document specified
    // by id in the author field and inserts it into the article document.
    Article.findOne({'articleId': req.params.articleId})
           .populate('author')
           .populate('comments.author')
           .exec(function(err, article) {
      if(err) {
        callback(err, null);
      }
      //console.log("article data: ", article.comments);
      callback(null, article);
    });
  },
  getUser: function(req, callback) {
    User.findOne({'userId': req.params.userId}, function(err, user) {
      if(err) {
        callback(err, null);
      }
      console.log("taysnimi: ", user.fullName)
      callback(null, user);
    });
  },
  getUserFullName: function(_id, callback) {
    User.findOne({'_id': _id}, function(err, user) {
      if(err) {
        callback(err, null);
      }
      callback(null, user.fullName);
    });
  },
  getArticlesSorted: function (callback) {
    Article.find({})
           .sort({dateCreated: 'desc'})
           .populate('author')
           .exec(function(err, articles) {

      if (err) {
          callback(err, null);
      }
      // Only take what we need instead of sending full data document background
      // containing personal information.
      var articlesArray = [];
      for (var i = 0; i < articles.length; i++) {
        var tempA = {};
        tempA.title = articles[i].title;
        tempA.author = articles[i].author.fullName;
        tempA.content = articles[i].content;
        tempA.dateCreated = new Date().toDateString(articles[i].dateCreated);
        tempA.articleId = articles[i].articleId;
        articlesArray.push(tempA);
      }
      callback(null, articlesArray);
    });
  }
}

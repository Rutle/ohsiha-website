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
          new Date().toDateString()
          tempA.dateCreated = new Date().toDateString(articles[i].dateCreated);
          articlesArray.push(tempA);
        }
        callback(null, articlesArray);
      });
    });
  },
  getArticle: function(req, callback) {
    Article.findOne({'articleId': req.params.articleId}, function (err, article) {
      if(err) {
        callback(err, null);
      }
      console.log("article data: ", typeof(article));
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
  }
}

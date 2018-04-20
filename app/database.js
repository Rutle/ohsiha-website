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
  // 1. Get articles from database and sort in descending order by creation date.
  // 2. Populate author field and select 3 fields that are used for the virtual function to get the fullName field.
  // 3. Select extra fields required to display enough information and exclude the _id fields.
  getArticlesSorted: function (callback) {
    Article.find({})
           .sort({dateCreated: 'desc'})
           .populate('author', 'local.firstName local.lastName twitter.displayName -_id')
           //.populate({ path: 'author', select: 'fullName' })
           .select('title content dateCreated formattedDate articleId -_id')
           .exec(function(err, articles) {

      if (err) {
          callback(err, null);
      }
      callback(null, articles);
    });
  },
  getUserArticlesSorted: function (_id, callback) {
    Article.find({author: _id})
           .sort({dateCreated: 'desc'})
           .populate('author', 'local.firstName local.lastName twitter.displayName -_id')
           //.populate({ path: 'author', select: 'fullName' })
           .select('title content dateCreated formattedDate articleId -_id')
           .exec(function(err, articles) {

      if (err) {
          callback(err, null);
      }
      callback(null, articles);
    });
  }
}

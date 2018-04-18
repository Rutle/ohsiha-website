'use strict';

// Swagger API controller functions for Article related requests.

var User    = require('../../app/models/user');
var Article = require('../../app/models/article')

module.exports = {
  getArticles: getArticles,
  getArticleById: getArticleById
};

// Return object containing title, articleId, content, dateCreated, userId,
// author and list of comments.
function getArticleById(request, response) {
  var articleId = request.swagger.params.articleId.value;
  Article.findOne({'articleId': articleId})
         .populate('author')
         .exec(function(err, article) {
    if(err) {
      response.status(404).json();
    }
    if(!article) {
      response.status(400).json();
    }
    var commentList = [];
    article.comments.forEach(function(element) {
      commentList.push(element.text);
    })
    response.status(200).json({title: article.title, articleId: articleId,
                               content: article.content,
                               dateCreated: article.formattedDate,
                               userId: article.author.userId,
                               author: article.author.fullName,
                               comments: commentList});
  });
};

// Return a list of objects containing articleId and userId.
function getArticles(request, response) {
  Article.find({})
         .populate('author')
         .exec(function(err, articles) {
     if(err) {
       response.status(404).json({message: "No articles were found."});
     }
     if(!articles) {
       response.status(404).json({message: "No articles were found."});
     }
     var articleList = [];
     articles.forEach(function(element) {
       articleList.push({articleId: element.articleId, userId: element.author.userId});
     })

     response.status(200).send(articleList);
  })
};

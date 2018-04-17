'use strict';

var User = require('../../app/models/user');
var Article = require('../../app/models/article')
var dbf = require('../../app/database')
// Module for handling API calls to /users

module.exports = {
  users: users,
  getUserById: getUserById
};
// Return object containing userId, name and list of articleIds.
function getUserById(request, response) {
  var userId = request.swagger.params.userId.value;
  //const userId = request.swagger.params.userId.value;
  User.findOne({userId: userId}, function(err, user) {
    if(err) {
      response.status(404).json();
    }
    if(!user) {
      response.status(400).json()
    }
    Article.find({author: user._id}, function(err, articles) {
      var articleList = [];
      if(err) {
        articleList.push("[0]Error finding articles.")
      }
      articles.forEach(function(element) {
        articleList.push(element.articleId);
      })
      response.status(200).json({id: user._userId, name: user.fullName, articleIds: articleList})
    });
  });
};

function users(request, response) {
  User.find({}, function(err, users) {
    if(err) {
      response.status(404).json({message: "No users were found."});
    }
    if(!users) {
      response.status(404).json({message: "No users were found."});
    }
    var userList = [];
    users.forEach(function(element) {
      userList.push({name: element.fullName, userId: element.userId});
    })
    console.log(users);

    response.status(200).send(userList);
  })
};

'use strict';

var User = require('../../app/models/user');
var Article = require('../../app/models/article')
var dbf = require('../../app/database')
var TweetData = require('../../app/models/twitterdata')

// Module for handling API calls to /users

module.exports = {
  getUsers: getUsers,
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
        articleList.push(["[0]Error in finding articles."])
      }
      articles.forEach(function(element) {
        articleList.push(element.articleId);
      });

      TweetData.findOne({author: user._id}, function(err, tweetdata) {
        var tempDataId = "null"
        if(err) {
          console.log(err);
        }
        if(tweetdata) {
          tempDataId = tweetdata.tweetDataId;
        }
        response.status(200).json({id: user.userId, name: user.fullName,
                                   tweetDataId: tempDataId,
                                   articleIds: articleList})
      });

    });
  });
};

function getUsers(request, response) {
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

    response.status(200).send(userList);
  })
};

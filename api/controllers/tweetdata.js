'use strict';

var User = require('../../app/models/user');
var Article = require('../../app/models/article')
var dbf = require('../../app/database')
var TweetData = require('../../app/models/twitterdata')

// Module for handling API calls to /users

module.exports = {
  getTweetDataList: getTweetDataList,
  getTweetDataById: getTweetDataById
};

// Return object containing tweetDataId, content list, dateCreated, userId and name of the user.
function getTweetDataById(request, response) {
  var tweetDataId = request.swagger.params.tweetDataId.value;
  //const userId = request.swagger.params.userId.value;
  TweetData.findOne({tweetDataId: tweetDataId})
           .populate('author')
           .exec(function(err, tweetData) {
    if(err) {
      response.status(404).json();
    }
    if(!tweetData) {
      response.status(400).json()
    }
    var tweetContent = tweetData.content;
    response.status(200).json({tweetDataId: tweetData.tweetDataId, content: tweetContent,
                               dateCreated: new Date().toDateString(tweetData.dateCreated),
                               userId: tweetData.author.userId,
                               author: tweetData.author.fullName})
  });
};

// Returns a list of objects containing tweetDataId, author's name and userId.
function getTweetDataList(request, response) {
  TweetData.find({})
           .populate('author')
           .exec(function(err, tweetData) {
    if(err) {
      response.status(404).json({message: "No data was found."});
    }
    if(!tweetData) {
      response.status(404).json({message: "No data was found."});
    }
    var tweetDataList = [];
    tweetData.forEach(function(element) {
      tweetDataList.push({tweetDataId: element.tweetDataId, name: element.author.fullName, userId: element.author.userId});
    })

    response.status(200).send(tweetDataList);
  })
};

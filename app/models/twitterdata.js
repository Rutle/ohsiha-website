'use strict';
// app/models/twitterdata.js
// Javascript file for MongoDB twitterdata-schema intended for storing twitter data.

var mongoose = require('mongoose');
var autoIncrement = require('simple-mongoose-autoincrement');

// MongoDB schema for an twitter data model.
var twitterDataSchema = mongoose.Schema({
  author: {                                 // ObjectId of the user
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  content: [String],
  dateCreated: {                            // Creation date of the document.
    type: Date,
    default: Date.now
  },
  dateModified: {                           // Modification date of the document.
    type: Date,
    default: Date.now
  },
});

twitterDataSchema.plugin(autoIncrement, { field: 'tweetDataId' });
module.exports = mongoose.model('TweetData', twitterDataSchema);

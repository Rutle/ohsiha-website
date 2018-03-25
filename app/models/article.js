// app/models/article.js
// Javascript file for MongoDB Article-schema intended for storing articles.

// Require 'mongoose' to get the needed schema object for user model.
var mongoose = require('mongoose');

// MongoDB schema for an article model.
var articleSchema = mongoose.Schema({
  author: {                           // ObjectId of the writer of the article.
    type: Schema.Types.ObjectId,
    required: true
  },
  title: {                            // Article title.
    type: String,
    required: true
  },
  content: {                          // Content of the article.
    type: String,
    required: false
  },
  dateCreated: {                      // Creation date of the article.
    type: Date,
    default: Date.now
  },
  dateModified: {                     // Modification date of the article.
    type: Date,
    default: Date.now
  },
  comments: [{
    text: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    dateCreated: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('Article', articleSchema);

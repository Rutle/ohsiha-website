'use strict';
// app/models/article.js
// Javascript file for MongoDB Article-schema intended for storing articles.
// Useful info: https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/
// I'm not sure if I should separate the comments into its own Schema.

var mongoose = require('mongoose');
var autoIncrement = require('simple-mongoose-autoincrement');

// MongoDB schema for an article model.
var articleSchema = mongoose.Schema({
  author: {                           // ObjectId of the writer of the article.
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateCreated: {
      type: Date,
      default: Date.now
    }
  }]
});

articleSchema.plugin(autoIncrement, { field: 'articleId' });
module.exports = mongoose.model('Article', articleSchema);

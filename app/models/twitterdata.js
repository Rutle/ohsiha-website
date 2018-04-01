// app/models/twitterdata.js
// Javascript file for MongoDB twitterdata-schema intended for storing twitter data.

var mongoose = require('mongoose');

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

module.exports = mongoose.model('TweetData', twitterDataSchema);

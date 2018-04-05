// batabase.js
// Database related functions

var mongoose = require('mongoose');

module.exports = {
  getArticles: function (userId, callback) {
    Article.find({author: req.user._id}, function (err, article) {
      
    }
  }
}

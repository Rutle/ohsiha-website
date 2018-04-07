'use strict';
// app/models/user.js
// Javascript file for MongoDB User-schema intended for storing user information.

// Require 'mongoose' to get the needed schema object for user model.
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var autoIncrement = require('simple-mongoose-autoincrement');

// MongoDB schema for user model that is used for storing data to the MongoDB.
var userSchema = mongoose.Schema({
  /* Extra information to User to be added. */
  rights: { type: String, default: 'User'},               // 'User' or 'Admin'
  local: {
    email: String,
    password: String,
    firstName: { type: String, default: 'None'},         // Name of user
    lastName: { type: String, default: 'None'},          // Last name.
  },
  twitter: {
      id: String,
      token: String,
      displayName: String,
      username: String
  },
});
userSchema.set('toObject', { getters: true });
userSchema.virtual('fullName').get(function() {
  var name = "";
  if (this.twitter.displayName === undefined) {
    if (this.local.firstName === undefined &&
        this.local.lastName === undefined) {
      name = "Unknown"
    } else if (this.local.firstName === undefined &&
               this.local.lastName !== undefined) {
      name = this.local.lastName
    } else if (this.local.firstName !== undefined &&
               this.local.lastName === undefined) {
      name = this.local.firstName
    } else {
      name = this.local.firstName+" "+this.local.lastName;
    }
  } else {
    name = this.twitter.displayName;
  }
  return name;
});


// userSchema's methods.
userSchema.methods.genHash = function(password) {
  // Encrypts 'password' with salt generated by genSaltSync.
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  // Compares given 'password' and hashed password in model.
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.local.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.plugin(autoIncrement, { field: 'userId' });
module.exports = mongoose.model('User', userSchema);

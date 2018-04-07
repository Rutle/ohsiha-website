'use strict';
// app/passport.js

// Purpose of this file is to configure our Passport strategies.
// Passport is used for authenticating requests and strategies are used for
// different types of authentications such as OAuth, basic local username/password
// authentication or even OpenID.
// http://www.passportjs.org/docs/
// https://www.npmjs.com/package/passport
// Example: https://github.com/passport/express-4.x-local-example
// Done following this tutorial: https://scotch.io/tutorials/easy-node-authentication-setup-and-local


// For basic local username/password authentication
var LocalStrategy     = require('passport-local').Strategy;
var TwitterStrategy   = require('passport-twitter').Strategy;
var User              = require('../app/models/user');

//var authData          = require('./auth');

module.exports = function(passport) {
  console.log('passport configuraatio');
  // To get authentication to work properly and have proper persistent sessions

  /* serializeUser
     Serialize authenticated user into the sessions by ID.

  */
  passport.serializeUser(function(user, done) {
    console.log("serializeUser called", user.id);
    done(null, user.id);
  });

  /* deserializeUser
     Authenticated user logs out etc. it has to be deserialized from the session
     by ID.
  */
  passport.deserializeUser(function(id, done) {
    console.log("deserializeUser called", id);
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Signup locally without OAuth etc.
  // Add our own strategy into passport that is used when new user signups
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    if (email)
      email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
    process.nextTick(function() {
      User.findOne({'local.email': email}, function(err, oldUser) {
        if(err)
          return done(err)

        if(oldUser)
          // User with given email already exists.
          return done(null, false, req.flash('signupMessage', 'That email is already in use by another user.'));
        // Connect new local account.
        if(req.user) {
          var user = req.user;
          user.local.email = email;
          user.local.password = user.genHash(password);
          user.local.firstName = req.body.fname;
          user.local.lastName = req.body.lname;

          user.save(function(err) {
            if (err)
              throw err;
            return done(null, user);
          });
        } else {
          // Create a new user. Not logged in.
          var newUser = new User();
          newUser.local.email = email;
          // Use the model method genHash() to hash the password.
          newUser.local.password = newUser.genHash(password);
          newUser.local.firstName = req.body.fname;
          newUser.local.lastName = req.body.lname;
          // Add new user into MongoDB.
          newUser.save(function(err) {
            if(err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });

  }));
  // Login locally without OAuth etc.
  // Add our own strategy into passport that is used when new user logs in.
  passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        // Find a user with the same email address.
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);
            // No such user.
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            // Wrong password.
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            return done(null, user);
        });

    }));

    // Passport configuration for twitter auth.
    passport.use(new TwitterStrategy({
      /*
        consumerKey: authData.twitterAuth.consumerKey,
        consumerSecret: authData.twitterAuth.consumerSecret,
        callbackURL: authData.twitterAuth.callbackURL,
        passReqToCallback: true
        */
        consumerKey: process.env.TWITTER_CON_KEY,
        consumerSecret: process.env.TWITTER_CON_SECRET,
        callbackURL: 'http://localhost:5000/auth/twitter/callback',
        passReqToCallback: true


    },
    function(req, token, tokenSecret, profile, done) {

        process.nextTick(function() {
          // Check if the user is logged in atm.
            if (!req.user) {
              User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                  // if there is an error, stop everything and return that
                  // ie an error connecting to the database
                  if (err)
                      return done(err);

                  // Found user is logged in.
                  if (user) {
                    if (!user.twitter.token) {
                      user.twitter.token = token;
                      user.twitter.username = profile.username;
                      user.twitter.displayName = profile.displayName;

                      user.save(function(err) {
                        if(err)
                          throw err;
                        return done(null, user);
                      });
                    }

                    return done(null, user);
                  } else {
                      // if there is no user, create them
                      var newUser  = new User();

                      // set all of the user data that we need
                      newUser.twitter.id          = profile.id;
                      newUser.twitter.token       = token;
                      newUser.twitter.username    = profile.username;
                      newUser.twitter.displayName = profile.displayName;

                      // save our user into the database
                      newUser.save(function(err) {
                          if (err)
                              throw err;
                          return done(null, newUser);
                      });
                  }
              });
            } else {
              // Link the account because user is already logged in.
              var user = req.user;
              user.twitter.id = profile.id;
              user.twitter.token = token;
              user.twitter.username = profile.username;
              user.twitter.displayName = profile.displayName;

              user.save(function(err) {
                if (err)
                  throw err;
                return done(null, user);
              });
            }


          });

    }));
};

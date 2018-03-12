// app/passport.js

// Purpose of this file is to configure our Passport strategies.
// Passport is used for authenticating requests and strategies are used for
// different types of authentications such as OAuth, basic local username/password
// authentication or even OpenID.
// http://www.passportjs.org/docs/
// https://www.npmjs.com/package/passport
// Example: https://github.com/passport/express-4.x-local-example


// For basic local username/password authentication
var LocalStrategy = require('passport-local').Strategy;
var User           = require('../app/models/user');


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
      User.findOne({'local.email': email}, function(err, user) {
        if(err)
          return done(err)
        if(user) {
          // User with given email already exists.
          return done(null, false, req.flash('signupMessage', 'That email is already in use by another user.'));
        } else {
          // console.log("Uusi kayttis 2");
          // Create a new user.
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
  // console.log('passport configuraatio loppu');
};

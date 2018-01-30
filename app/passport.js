// app/passport.js

// Purpose for this file is to configure our Passport strategies.
// Passport is used for authenticating requests and strategies are used for
// different types of authentications such as OAuth, basic username/password
// authentication or even OpenID.
// http://www.passportjs.org/docs/
// https://www.npmjs.com/package/passport
// Example: https://github.com/passport/express-4.x-local-example


// For basic local username/password authentication
var LocalPassStrat = require('passport-local').Strategy;
var User           = require('../app/models/user');


module.exports = function(passport) {
  // To get authentication to work properly and have proper persistent sessions

  /* serializeUser
     Serialize authenticated user into the sessions by ID.
  */
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  /* deserializeUser
     Authenticated user logs out etc. it has to be deserialized from the session
     by ID.
  */
  passport.deserializeUser(function(id, done) {
    //
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Signup locally without OAuth etc.
  // Add our own strategy into passport that is used when new user signups
  // 'locally' as in without OAuth.
  passport.use('localSignup', new LocalPassStrat({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({'basicLocal.email': email}, function(err, user) {
        if(err)
          return done(err)
        if(user) {
          // User with given email already exists.
          return done(null, false, req.flash('signupMessage', 'That email is already in use by another user.'));
        } else {
          // Create a new user.
          var newUser = new User();
          newUser.basicLocal.email = email;
          // Use the model method genHash() to hash the password.
          newUser.basicLocal.password = newUser.genHash(password);
          
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
};

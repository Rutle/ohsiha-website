// app.js

'use strict';
require('dotenv').config(); // Provides ability to use 'process.env.X' locally
var mongoose        = require('mongoose');
var SwaggerExpress  = require('swagger-express-mw');
var swaggerUi       = require('swagger-ui-express');
const YAML          = require('yamljs');
var express         = require('express');
var port            = process.env.PORT || 5000;
var passport        = require('passport')
var flash           = require('connect-flash');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');
var helpers 				= require('handlebars-helpers')(['comparison', 'array']);

const exphbs        = require('express-handlebars');
const path          = require('path');
const publicPath    = path.join(__dirname, '/views');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// Connection to database.
// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = process.env.MONGODB_URI || 'mongodb://localhost';
mongoose.connect(uristring, function (err, res) {
	if (err) {
		console.log('ERROR connecting to: ' + uristring + '. ' + err);
	} else {
		console.log ('Succeeded connected to: ' + uristring);
	}
});

// Database functions
var dbf = require('./app/database');

// Routes
var routes = require('./app/routes');

// Tweets
var twit = require('./app/tweets');

// Markov
var markovGen = require('./app/markovgen');

// Article Schema
var Article = require('./app/models/article');

// User Schema
var User = require('./app/models/user');

// TwitterData schema
var TwitterData = require('./app/models/twitterdata');

var config = {
  appRoot: __dirname // required config
};


// Configure passport with strageties to handle authentications.
require('./app/passport')(passport);

const app = express();

// #### Engine configuration ####
app.engine('.hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views/layouts'),
	helpers: helpers,
	partialsDir: ['views/partials']
}));

app.set('view engine', '.hbs');

// #### Setup middleware ####
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/'));
app.use('/d3-cloud', express.static(__dirname + '/node_modules/d3-cloud/build/'));
app.use('/', express.static(publicPath));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // Adds additional information to request (req.cookie).
app.use(session({
	secret: "It's a secret!",
	resave: true,
	saveUninitialized: true
	})
);
app.use(bodyParser.json()); // Adds additional information to request (req.body).
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



// #### Routing of URLs ####
// #### GET	####
// Base URL (index)
app.get('/', function(req, res, next) {
	res.render('home', {
		user : req.user,
		userIsLogged : (req.user ? true : false),
	});
});

// Shows articles and does pagination.
app.get(['/blog','/blog/:page(\\d+)/'], routes.blog );

// Possible Admin page. (Maybe once I integrate this to my own website.)
app.get('/admin', isLoggedIn, function(req, res) {
	if(req.user.rights === "Admin") {
		res.render('admin', {
			user: req.user,
			userIsLogged: (req.user ? true : false)
		});
	} else {
		res.render('home', {
			user:req.user,
			userIsLogged: (req.user ? true : false)
		});
	}

});

// Logout route
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Login route
app.get('/login', function(req, res){
	var loginMessage = req.flash('loginMessage');
  var successMessage = true;
  if((loginMessage.length > 0)) {
    successMessage = false;
  }
  res.render('login', {
    message: loginMessage[0],
    isSuccess: successMessage,
		userIsLogged : (req.user ? true : false)
  });
});

// Signup route
app.get('/signup', function(req, res){
	var signupMessage = req.flash('signupMessage');
  var successMessage = true;
  if(signupMessage.length > 0) {
    successMessage = false;
  }
  res.render('signup', {
    message: signupMessage,
    success: successMessage,
		userIsLogged : (req.user ? true : false)
  });
});

// Updated profile route
app.get('/profileUpdated', isLoggedIn, function(req, res) {
  res.render('profileUpdated', {
		userIsLogged : (req.user ? true : false),
		user: req.user
  });
});

// Dashboard route
app.get('/dashboard', isLoggedIn, routes.getDBoard);

// Twitter Routes
// Authentication
app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

// Callback handler.
app.get('/auth/twitter/callback',
	passport.authenticate('twitter', {
		successRedirect: '/dashboard',
		failureRedirect: '/'
	}
));

// Connect twitter and local account
app.get('/connect/local', function(req, res) {
	var signupMessage = req.flash('signupMessage');
	var isSuccessMessage = true;
	if(signupMessage.length > 0) {
		isSuccessMessage = false;
	}
	res.render('connect-local.hbs', {
		message: signupMessage,
		success: isSuccessMessage,
		userIsLogged : (req.user ? true : false)
	});
});

app.post('/connect/local', passport.authenticate('local-signup', {
	successRedirect: '/dashboard',
	failureRedirect: '/connect/local',
	failureFlash: true
}));

// send to twitter passport to do the authentication
app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

// handle the callback after twitter has authorized the user
app.get('/connect/twitter/callback',
		passport.authorize('twitter', {
				successRedirect : '/dashboard',
				failureRedirect : '/'
}));

// Unlink accounts
// Local unlinking
app.get('/unlink/local', function(req, res) {
	var user            	= req.user;
	user.local.email    	= undefined;
	user.local.password 	= undefined;
	user.local.firstName 	= undefined;
	user.local.lastName 	= undefined;

	user.save(function(err) {
		res.redirect('/dashboard');
	});
});

// twitter unlinking
app.get('/unlink/twitter', function(req, res) {
	var user           = req.user;
	user.twitter.id = undefined;
	user.save(function(err) {
		res.redirect('/dashboard');
	});
});

// Show article
app.get('/article/:articleId', routes.showArticle);


// ####	POST	####
// Handles submitted login form. (POST)
// Use 'local-login' strategy.
app.post('/login', passport.authenticate('local-login', {
  successRedirect : '/dashboard', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
	})
);

// Handles submitted signup form. (POST)
// Use 'local-signup' strategy.
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/dashboard', // redirect to the secure profile section
  failureRedirect : '/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
  })
);

// Handles submitted profile form. (POST)
// Use validator to check that the fields contain data in the correct form.
app.post('/profile', isLoggedIn, [
	// Checks the form's input field based on the "name"-property.
	check('password').exists().not().isEmpty(),
	check('fname').exists().trim(),
	check('lname').exists().trim()

], function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.mapped());
		return res.render('profileUpdated', {
			isSuccess: false,
			errors: errors.mapped(),
			userIsLogged: (req.user ? true : false),
			user: req.user
		});
	}
	next();
}, routes.updateProfile);

// A preview on dashboard.
app.post('/articlepreview', isLoggedIn, [
	// Checks the form's input field based on the "name"-property.
	check('title', 'Title must be at least 5 chars long').exists().isLength({ min: 5 }).trim()
], function (req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400);
		return res.render('error', {error: 'Bad Request.', errors: errors.mapped()});
	}
	next();
}, routes.addPost);

// Dashboard's form handling
app.post('/dashboard', isLoggedIn, routes.postDBoard);


// Commenting on an article.
app.post('/article/:articleId', isLoggedIn, [
	// Checks the form's input field based on the "name"-property.
	check('commentData').exists().not().isEmpty().trim()
], function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.render('error', { error: 'Bad Request.',
			errors: errors.mapped()});
	}
	next();
}, routes.postComment);

// Delete user and all related data. Leaves comments.
app.post('/deleteUser', isLoggedIn, routes.deleteUser );

// Check if user is logged in with a middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

module.exports = app; // for testing

/* Swagger configuration */
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  app.listen(port);

});

// Include the API documentation using Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

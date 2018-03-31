// app.js

'use strict';
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
var session         = require('express-session')

const exphbs        = require('express-handlebars');
const hbsHelpers 		= require('./app/hbsHelpers');
const path          = require('path');
const publicPath    = path.join(__dirname, '/views');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// Tweets
var twit = require('./app/tweets');

// Markov
var markovGen = require('./app/markovgen')

// Article Schema
var Article = require('./app/models/article');

// User Schema
var User = require('./app/models/user');

// Routes
// var routes = require('./app/routers');

// Connection to database.
mongoose.connect('mongodb://localhost');

// Configure passport with strageties to handle authentications.
require('./app/passport')(passport);

const app = express();

// #### Engine configuration ####
app.engine('.hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views/layouts'),
	helpers: hbsHelpers,
	partialsDir: ['views/partials']
}));

app.set('view engine', '.hbs');

// #### Setup middleware ####
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/'));
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
app.get('/', function(req, res) {
	res.render('home', {
		user : req.user,
		userIsLogged : (req.user ? true : false)
	});
});

// Possible Admin page.
app.get('/admin', isLoggedIn, function(req, res) {
	if(req.user.rights === "Admin") {
		return res.render('admin', {
			user: req.user,
			userIsLogged: (req.user ? true : false)
		});
	} else {
		return res.render('home', {
			user:req.user,
			userIsLogged: (req.user ? true : false)
		});
	}

});

// Testing and possible page for profile and additional information.
app.get('/profile', isLoggedIn, function(req, res){
	var twitterLink = true;
	var localLink = true;
	if (req.user.twitter.token === undefined) {
		twitterLink = false;
	}
	if (req.user.local.email === undefined) {
		localLink = false;
	}

  res.render('profile', {
      user : req.user,
			isTwitterLinked: twitterLink,
			isLocalLinked: localLink,
			userIsLogged : (req.user ? true : false)
  });
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
  if((loginMessage.size > 0)) {
    successMessage = false;
  }
  res.render('login', {
    message: loginMessage,
    success: successMessage,
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

app.get('/dashboard', isLoggedIn, function(req, res) {
	var twitterLink = true;
	if (req.user.twitter.token === undefined) {
		twitterLink = false;
	}
	res.render('dashboard', {
		userIsLogged: (req.user ? true : false),
		user: req.user,
		isTwitterLinked: twitterLink
	})
})

// Twitter Routes
// Authentication
app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

// Callback handler.
app.get('/auth/twitter/callback',
	passport.authenticate('twitter', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}
));

// Connect twitter and local account
app.get('/connect/local', function(req, res) {
	var signupMessage = req.flash('signupMessage');
	var successMessage = true;
	if(signupMessage.length > 0) {
		successMessage = false;
	}
	res.render('connect-local.hbs', {
		message: signupMessage,
		success: successMessage,
		userIsLogged : (req.user ? true : false)
	});
});

app.post('/connect/local', passport.authenticate('local-signup', {
	successRedirect: '/profile',
	failureRedirect: '/connect/local',
	failureFlash: true
}));
// send to twitter to do the authentication
app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

// handle the callback after twitter has authorized the user
app.get('/connect/twitter/callback',
		passport.authorize('twitter', {
				successRedirect : '/profile',
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
		res.redirect('/profile');
	});
});

// twitter unlinking
app.get('/unlink/twitter', function(req, res) {
	var user           = req.user;
	user.twitter.token = undefined;
	user.save(function(err) {
		res.redirect('/profile');
	});
});


// ####	POST	####
// Handles submitted login form. (POST)
// Use 'local-login' strategy.
app.post('/login', passport.authenticate('local-login', {
  successRedirect : '/profile', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
	})
	// Gets called if auth was success, however, with redirect skips this part
	//,
	//function(req, res) {

	//}
);

// Handles submitted signup form. (POST)
// Use 'local-signup' strategy.
app.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/profile', // redirect to the secure profile section
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

], function(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.render('profile', {
			isSuccess: false,
			errors: errors.mapped(),
			userIsLogged: (req.user ? true : false),
			user: req.user
		});
	}
	const userData = matchedData(req);
	User.findOne({'local.email': req.user.local.email}, function(err, user) {
		if(err) {
			return done(err);
		}
		console.log(req.body.password)
		user.comparePassword(req.body.password, function(err, isMatch) {
			if (err) {
				console.log(err);
			} else {
				// Modify user's information acquired from the form.
				if (!(req.body.fname === "")) {
					user.local.firstName = req.body.fname;
				}
				if (!(req.body.lname === "")) {
					user.local.lastName = req.body.lname;
				}
				// Update information.
				user.save(function (err) {
					if(err) {
						console.error(err);
					}
				});
			}
		});
	});
	res.render('profileUpdated', {
		userIsLogged: (req.user ? true : false),
		user: req.user
	});
});

app.post('/articlepreview', isLoggedIn, [
	check('numTweets').exists().not().isEmpty(),
	check('title').exists().trim(),
], function(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.render('articlepreview', {
			isSuccess: false,
			errors: errors.mapped(),
			userIsLogged: (req.user ? true : false),
			user: req.user
		});
	}
	// matchedData returns only the subset of data validated by the middleware
	const postData = matchedData(req);
	console.log(postData);
	var blogPost = "";
	var title = "Clever musings.";
	var dateCreated = new Date();
	console.log("id ", req.user._id);
	User.findById(req.user._id, function(err, user) {
		if(err) {
			return done(err);
		}
		console.log(user);
		// Article consists of:
		/*
		author
		title
		content
		dateCreated
		dateModified
		comments: [author, dateCreated]
		*/

		var newArticle = new Article();
		newArticle.author = user._id;
		newArticle.title = title;
		newArticle.content = "Testi";
		var dateCreated = new Date(newArticle.dateCreated);
		// Add a new article into database.
		newArticle.save(function(err) {
			if(err) {
				console.error(err);
			}
		});

	});
	console.log(dateCreated);
	res.render('articlepreview', {
		isSuccess: true,
		userIsLogged: (req.user ? true : false),
		user: req.user,
		blogPost: blogPost,
		title: title,
		dateCreated: dateCreated.toDateString()
	});
});

app.post('/submitpost', isLoggedIn, )

app.post('/deleteUser', isLoggedIn, function(req, res){
  // Perhaps also remove all blog posts by this user as well.
	User.findByIdAndRemove({ _id: req.user._id }, function(err, user) {
		if(err) {
			return done(err);
		} else {
			console.log("user removed");
		}
	});
	req.logout();
	res.redirect('/');
});
// Check if user is logged in with a middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

/* Swagger configuration */
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  app.listen(port);
	/*
  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }*/
});

// Include the API documentation using Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

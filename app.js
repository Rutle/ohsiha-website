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

// Databoard route
var dBoard = require('./app/dashroute');

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

// Routes
// var routes = require('./app/routers');


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

app.get(['/blog','/blog/:page(\\d+)/'], function(req, res, next) {
	console.log(req.params.page, " Type: ", typeof(req.params.page));
	var currentPage = 0;
	if(typeof(req.params.page) === 'undefined' || req.params.page === "0" || req.params.page === "1") {
		// Main page
		currentPage = 1;
	} else {
		currentPage = parseInt(req.params.page);
	}
	var isArticles = true;
	dbf.getArticlesSorted(function(err, articles) {
		if(err) {
			isArticles = false;
			res.status(500);
			return res.render('error', { error: 'Database error.' });
		}

		if(articles.length === 0) {
			isArticles = false;
		}
		//console.log("CurrentPage: ", currentPage);
		//console.log("alusta: ", ((currentPage-1)*5), " asti: ", (currentPage*5));
		var pageArticles = articles.slice(((currentPage-1)*5), (currentPage*5));
		//console.log("artikkelit: ", pageArticles);
		var articleCount = articles.length;
		var maxPageCount = 0;
		//5 articles previews per page.
		var maxPageCount = Math.floor(articleCount/5);
		if (articleCount % 5 === 0) {
			maxPageCount = Math.floor(articleCount/5);
		} else {
			maxPageCount = Math.floor(articleCount/5) + 1
		}
		//var remainder = articleCount - (pages*5);
		//console.log("Sivut: ", pages, " Seuraavalle sivulle jaa: ", remainder);
		//console.log("Artikkelit haettu sortatusti: ", articles);
		res.render('blog', {
			user : req.user,
			userIsLogged : (req.user ? true : false),
			articles: pageArticles,
			isArticles: isArticles,
			prevPage: currentPage-1,
			curPage: currentPage,
			nextPage: currentPage+1,
			maxPages: maxPageCount
		});
	})
});

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
/*
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
*/
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
	console.log(loginMessage[0]);
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
app.get('/dashboard', isLoggedIn, dBoard.getDBoard);

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
	user.twitter.token = undefined;
	user.save(function(err) {
		res.redirect('/dashboard');
	});
});

app.get('/article/:articleId', function(req, res, next) {

  console.log("Artikkelia: ", req.params.articleId, " haetaan");
  dbf.getArticle(req, function(err, data) {
    if(err) {
			res.status(500);
			return res.render('error', { error: 'Database error when trying to find an article.' });
    }
    // Couldn't find an article with given ID.
    if (data.length === 0) {
      isArticle = false;
      res.render('fullarticle', {
        userIsLogged: (req.user ? true : false),
        user: req.user,
        articleExists: false
      });
    } else {
      res.render('fullarticle', {
        userIsLogged: (req.user ? true : false),
        user: req.user,
        title: data.title,
        blogPost: data.content,
        author: data.author.fullName,
        dateCreated: new Date(data.dateCreated).toDateString(),
        articleExists: true,
				articleId: data.articleId,
				comments: data.comments
      })
    }

  });
});

app.get('/user/:userId', function(req, res, next) {
  console.log("User: ", req.params.userId, " haettu");
  dbf.getUser(req, function(err, data) {
    console.log(data);
  });
});


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

], function(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.render('profileUpdated', {
			isSuccess: false,
			errors: errors.mapped(),
			userIsLogged: (req.user ? true : false),
			user: req.user
		});
	}
	const userData = matchedData(req);
	User.findOne({'local.email': req.user.local.email}, function(err, user) {
		if(err) {
			return next(err);
		}
		//console.log(req.body.password)
		user.comparePassword(req.body.password, function(err, isMatch) {
			if (err) {
				res.status(500);
				return res.render('error', { error: 'Error happened when comparing passwords.' });
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
						res.status(500);
						return res.render('error', { error: 'Database error when trying to save changes.' });
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


app.post('/articlepreview', isLoggedIn, function(req, res) {

	console.log("Article posted!");
	//console.log(req.body.generatedPost);
	var blogPost = req.body.generatedPost;
	var title = req.body.title;
	var dateCreated = new Date();

	User.findById(req.user._id, function(err, user) {
		if(err) {
			res.status(500);
			return res.render('error', { error: 'Database error when trying to find an user.' });
		}

		var newArticle = new Article();
		newArticle.author = user._id;
		newArticle.title = title;
		newArticle.content = blogPost;
		var dateCreated = new Date(newArticle.dateCreated);

		// Add a new article into database.
		newArticle.save(function(err) {
			if(err) {
				res.status(500);
				return res.render('error', { error: 'Database error when trying to save an article.' });
			}
		});

	});
	//console.log(dateCreated);
	res.render('articlepreview', {
		isSuccess: true,
		userIsLogged: (req.user ? true : false),
		user: req.user,
	});
});

app.post('/dashboard', isLoggedIn, dBoard.postDBoard);

app.post('/article/:articleId', isLoggedIn, [
	// Checks the form's input field based on the "name"-property.
	check('commentData').exists().not().isEmpty().trim()
], function(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.render('commentfailed', {
			errors: errors.mapped(),
		});
	}
	const comData = matchedData(req);

	// Explanation:
	// Article schema contains an array which contains objects with fields text,
	// author and dateCreated. We make an object like that.
	var comment = {text: comData.commentData, author: req.user._id,
								 dateCreated: new Date()};
	// We get the article and update it with the mongoose function and use option
	// '$push' to insert the object into the array. With the 'new: true' we recieve
	// the new updated document back to which we then use .populate functions
	// to fetch the author objects from User documents.
	Article.findOneAndUpdate({'articleId':req.params.articleId},
													 {$push:{comments: comment} },
													 {new: true}).populate('comments.author')
													 .exec(function(err, data) {
			if(err) {
				return res.render('commentfailed', {errors: err});
			}
			res.redirect('/article/'+req.params.articleId);
			//console.log(JSON.stringify(data.comments));
			/*
			res.render('fullarticle', {
				userIsLogged: (req.user ? true : false),
				user: req.user,
				title: data.title,
				blogPost: data.content,
				author: data.author.fullName,
				dateCreated: new Date(data.dateCreated).toDateString(),
				articleExists: true,
				comments: JSON.stringify(data.comments),
				articleId: data.articleId,
			});
			*/
		});
});


app.post('/deleteUser', isLoggedIn, function(req, res){
  // Perhaps also remove all blog posts by this user as well.
	User.findByIdAndRemove({ _id: req.user._id }, function(err, user) {
		if(err) {
			res.status(500);
			return res.render('error', { error: 'Database error when trying to delete user.' });
		}
		console.log("user removed");
		TwitterData.findOneAndRemove({author: req.user._id}, function(err, data) {
			if(err) {
				res.status(500);
				return res.render('error', { error: 'Database error when trying to delete tweetdata.' });
			}
			Articles.find({author: req.user._id}, function(err, articles) {
				if(err) {
					res.status(500);
					return res.render('error', { error: 'Database error when trying to delete articles.' });
				}
			});
		});
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

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
var User            = require('./app/models/user');
const exphbs        = require('express-handlebars');
const hbsHelpers 		= require('./app/hbsHelpers');
const path          = require('path');
const publicPath    = path.join(__dirname, '/views');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');

const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// Routes
var routes = require('./app/routers');

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
	helpers: hbsHelpers
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
// #### 			GET 			####
// Base URL (index)
app.get('/', function(req, res) {
	res.render('home', {
		user : req.user,
		userIsLogged : (req.user ? true : false)
	});
});

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
  res.render('profile', {
      user : req.user,
			userIsLogged : (req.user ? true : false)
  });
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
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

app.get('/signup',function(req, res){
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

app.get('/profileUpdated', function(req, res){
  res.render('profileUpdated', {
		userIsLogged : (req.user ? true : false),
		user: req.user
  });
});



// #### 			POST 			####
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
// Use validator to check that the fields container data in correct form.
app.post('/profile', isLoggedIn, [
	// Checks the form's input field based on "name"-property.
	check('password').exists().not().isEmpty(),
	check('fname').exists(),
	check('lname').exists()
	// ...or throw your own errors using validators created with .custom()
	/*
  .custom(value => {
    return findUserByEmail(value).then(user => {
      throw new Error('this email is already in use');
    })
  })*/

], function(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors.mapped());
		return res.render('profile', {
			isSuccess: false,
			errors: errors.mapped(),
			userIsLogged: (req.user ? true : false),
			user: req.user
		});
	}
	// Tee muutokset databaseen, jos ei tule virheitä.
	const userData = matchedData(req);
	User.findOne({'local.email': req.user.local.email}, function(err, user) {
		if(err) {
			return done(err);
		} else {
			// Modify user's information acquired from the form.
			if (!(req.body.fname === "")) {
				user.name = req.body.fname;
			}
			if (!(req.body.lname === "")) {
				user.surname = req.body.lname;
			}
			// Update information.
			user.save(function (err) {
				if(err) {
					console.error('ERROR');
				}
			});
		}
	});
	res.render('profileUpdated', {
		userIsLogged: (req.user ? true : false),
		user: req.user
	});
});

app.post('/deleteUser', isLoggedIn, function(req, res){

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

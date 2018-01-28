// app.js

'use strict';
var mongoose        = require('mongoose');
var SwaggerExpress  = require('swagger-express-mw');
var swaggerUi       = require('swagger-ui-express');
const YAML          = require('yamljs');
var express         = require('express');
var port            = process.env.PORT || 10010;
var passport        = require('passport')
var flash           = require('connect-flash');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session')
const exphbs        = require('express-handlebars');
const path          = require('path');
const publicPath    = path.join(__dirname, '/views');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');

// Connection to database.
//mongoose.connect('mongodb://localhost/test');

const app = express();

/* Configurations */
app.engine('.hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', '.hbs');
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/'));
app.use('/', express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
	secret: "It's a secret!",
	resave: true,
	saveUninitialized: true
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routing of URLs

app.get('/', (req, res) => { // '/' url it is listening
	res.render('home');
});

app.get('/login', function(req, res) {
    res.render('login');
});

// process the login form
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// SIGNUP =================================
// show the signup form
app.get('/signup', function(req, res) {
    res.render('signup', {
      message: req.flash('signupMessage')
    });
});

// process the signup form
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

//module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

/* Swagger configuration */
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});

// Include the API documentation using Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

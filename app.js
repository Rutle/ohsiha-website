'use strict';
var mongoose        = require('mongoose');
var SwaggerExpress  = require('swagger-express-mw');
var express         = require('express');
//const db            = require('./db/database.js')
var port            = process.env.PORT || 10010;
var passport        = require('passport')
var session         = require('express-session')
const exphbs        = require('express-handlebars');
const path          = require('path');
const publicPath    = path.join(__dirname, '/views');

const app = express();

app.engine('.hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', '.hbs');
app.use('/', express.static(publicPath));

app.use(session({
	secret: "It's a secret!",
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false}
	})
);

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};
app.get('/', (req, res) => { // '/' url it is listening
	res.render('home');
});
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);


  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});

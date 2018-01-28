'use strict';
var mongoose        = require('mongoose');
var SwaggerExpress  = require('swagger-express-mw');
var swaggerUi       = require('swagger-ui-express');
const YAML          = require('yamljs');
var express         = require('express');
//const db            = require('./db/database.js')
var port            = process.env.PORT || 10010;
var passport        = require('passport')
var session         = require('express-session')
const exphbs        = require('express-handlebars');
const path          = require('path');
const publicPath    = path.join(__dirname, '/views');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
mongoose.connect('mongodb://localhost/test');

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

app.use(session({
	secret: "It's a secret!",
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false}
	})
);
app.get('/', (req, res) => { // '/' url it is listening
	res.render('home');
});
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

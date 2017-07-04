var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var Promise = require('bluebird');

var config = require('./config')();

var app = express();

// redirect to https (this is a Heroku thing)
app.use(function(req, res, next) {
  if (req.headers['x-forwarded-proto'] === 'http') {
    console.log('Redirecting an insecure Heroku connection to HTTPS');
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});

// connect to MongoDB
mongoose.Promise = Promise;
mongoose.connect(config.mongodb.uri);

// view engine setup
let hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts')
});
app.engine('handlebars', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(favicon(path.join(__dirname, '../public', 'favicon/favicon.ico')));

// set up API stuff
app.all( '/api/*', function( req, res, next ) {
    // res.header( 'Access-Control-Allow-Origin', '*' );
    // res.header( 'Access-Control-Allow-Method', 'POST, GET, PUT, DELETE, OPTIONS' );
    // res.header( 'Access-Control-Allow-Headers', 'origin, x-requested-with, x-file-name, content-type, cache-control' );
    // Process preflight if it is OPTIONS request
    if( 'OPTIONS' === req.method ) {
        res.send( 203, 'No Content' );
    } else {
        next();
    }
});

app.use(morgan(':remote-addr :remote-user - :method :url :status :response-time ms - :res[content-length]', {
  skip: (req, res) => {
    return req.path.match(/\.js|\.html|\.css|\.jpg|\.png|\.ico/);
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));

app.use(require('./routes'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    // res.json(err);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  // res.json({error: "Server Error!"});
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

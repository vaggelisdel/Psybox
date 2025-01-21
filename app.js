var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var hbs = require("hbs")
hbs.registerHelper("equal", require("handlebars-helper-equal"));
var logger = require('morgan');
var flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
const passport = require("passport");

mongoose.connect(`mongodb+srv://vaggelisdel:Del123!@#A@cluster0-x12oj.mongodb.net/Psybox?retryWrites=true&w=majority`)
    .then(() => console.log('Connected!'));

require('./config/googleUserAuth');
require('./config/facebookUserAuth');

var publicRouter = require('./routes/Public/index');
var panelRouter = require('./routes/Community/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(session({
  secret: 'kuFqcimhu78uadWeEzh3oZuzgKy38NfO',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(express.json());
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', publicRouter);
app.use('/community', panelRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

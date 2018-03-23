var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fsr = require('file-stream-rotator');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require("passport");
var flash = require("connect-flash");
var busboy = require('connect-busboy');
//...
var index = require('./routes/index');

require("./passport-init");

var db = require("./config/configDB").url;

var app = express();

var logDirectory = path.join(__dirname, 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var date = new Date().toISOString();
var accessLogStream = fsr.getStream({
  date_format: 'YYYY-MM-DD',
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
  
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static("node_modules/jquery/dist"));
app.use(express.static("node_modules/chart.js/dist"));
// app.use(express.static("node_modules/bootstrap/dist"));
app.use(express.static("node_modules/bootstrap-notify"));
// require("express-debug")(app, {});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined', {stream: accessLogStream}));

app.use(require('express-session')({
  secret: 'keyboard cat', resave: false, saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

var authRouter = require("./routes/auth");
app.use(authRouter);
var appApi = require("./routes/appApi");
app.use("/app_api", appApi);
var mobileApi = require("./routes/mobileApi");
app.use("/app_api", mobileApi);
var logApi = require("./routes/logApi");
app.use("/log_api", logApi);

app.use(function(req, res, next) {
  if(req.isAuthenticated()) {
    res.locals.user = req.user;
    next();
  }else if(req.url === "/portal" || req.url === "/hold-quizzes" || req.url === "/hold-quiz" || req.url === "/quiz") {
      res.redirect("/login");
  } else {
    next();
  }
});

app.use('/', index);

// catch 404 and forward to error handler


// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;

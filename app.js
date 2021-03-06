const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const router = require('./routes/routes');
const cors = require('cors');
const session = require('express-session');
const configs = require('./config');
const MongoDBStore = require('connect-mongodb-session')(session);

//Configurations
const sessionName = configs.SESSION_NAME;
const sessionSecret = configs.SESSION_SECRET;
const environment = configs.ENVIRONMENT;

const app = express();

const mongoDBStore = new MongoDBStore({

  uri: 'mongodb://localhost:27017/OAuth-Drive-Upload',
  collection: 'mySessions'

}, (error) => {

  if(error) {
    console.log('Mongodb error - ' + error);
  }
  else{
    console.log('Connected to mongodb for session management successfully.');
  }

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/javascripts/')));
app.use(express.static(path.join(__dirname, 'public/stylesheets/')));

app.use(session({

  name: sessionName,
  resave: false,
  saveUninitialized: false,
  secret: sessionSecret,
  store: mongoDBStore,
  cookie: {
    sameSite: true,
    secure: environment === 'Production'
  } 
}));

app.use('/', router);


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

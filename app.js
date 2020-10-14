var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var models = require('./models');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var commentsRouter = require('./routes/comments');

var passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;

var app = express();

passport.use('kakao', new kakaoStrategy({
  clientID: '{REST_API}',
  callbackURL: 'http://localhost:3000/users/kakao/oauth'
},
  function(accessToken, refreshToken, profile, done) {        
    let newId = profile.id;

    models.User.findOne({
      where: {
        user_id: newId
      }
    }).then(loginUser => {
      if(loginUser != null)
      {        
        return done(null, loginUser);
      }
      else {
        models.User.create({
          user_id: newId,          
        }).then(user => {          
          return done(null, user);
        });
      }
    });    
  }
));

var JWTExtractor = function(req) {
  let token = null;
  if(req && req.cookies)
    token = req.cookies['jwt'];
  return token;
};

passport.use(new JWTStrategy({
  jwtFromRequest : JWTExtractor,
  secretOrKey: 'secret_key' //temp  
},
  function(jwtPayload, done) {
    return models.User.findOne({
      where: {
        user_id: jwtPayload.user_id
      }
    }).then(user => {
      return done(null, user);
    }).catch(err => {
      return done(err);
    });
  }
));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);

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

var express = require('express');
var router = express.Router();
var passport = require('passport');
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login/kakao', passport.authenticate('kakao'));

router.get('/kakao/oauth', passport.authenticate('kakao', {  
  session: false,
  failureRedirect: '/users/kakao'
}), (req, res) => {
  const token = jwt.sign({
    user_id: req.user.user_id
  },
  'secret_key'
  );  
  res.cookie('jwt', token);
  return res.redirect('/');
}
);

router.get('/logout', (req, res) => {
  res.clearCookie("jwt");
  return res.redirect('/');
}
);

module.exports = router;

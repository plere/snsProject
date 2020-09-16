var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login/kakao', passport.authenticate('kakao'));

router.get('/kakao/oauth', passport.authenticate('kakao', {  
  session: false,
  failureRedirect: '/user/kakao'
}), (req, res) => {
  const token = jwt.sign({
    user_id: req.user.user_id
  },
  'secret_key'
  );  
  res.cookie('jwt', token);
  return res.sendStatus(200);
}
);


module.exports = router;

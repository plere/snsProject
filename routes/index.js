var express = require('express');
const passport = require('passport');
const { sequelize } = require('../models');
var router = express.Router();
var models = require('../models');

/* GET home page. */
router.get('/', (req, res, next) => {
	passport.authenticate('jwt', {session: false}, (err, user, info) => {
		if(err) return res.sendStatus(500);
		if(user)
			return res.render('index', {name: user.user_id, picture: '/images/user.png'});
		else
			return res.render('index', {name: '비로그인 유저', picture: '/images/user.png'});
	})(req, res, next);
});

router.get('/load', function(req, res, next) {
	models.Post.findAll().then(async posts => {
		for(post of posts) {			
			if(post.comments) {
				let cmtArr = [];
				for(val of post.comments) {
					const comment = await models.Comment.findOne({
						where: {
							comment_id: val
						}
					});
					cmtArr.push({comment_id: comment.comment_id, author: comment.author, comment: comment.comment});
				}
				post.dataValues.comments = cmtArr.slice();
			}
		}					
		
		res.json(posts);
	});
});

module.exports = router;
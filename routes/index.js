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

router.post('/write', function(req, res, next) {
	var author = req.body.author;
	var picture = req.body.picture;
	var contents = req.body.contents;
	var date = Date.now();	

	models.Post.create({
		author: author,
		picture: picture,
		contents: contents,		
		like: 0,
		createdAt: date,
		updatedAt: date,
	}).then(() => {
		return res.json({status: "SUCCESS"});
	}).catch(err => {
		if(err) console.log(err);
		return res.sendStatus(500);
	});
});

router.post('/like', function(req, res, next) {
	var post_id = req.body.post_id;
	// var contents = req.body.contents;	

	models.Post.findOne({
		where: {
			post_id: post_id
		}
	}).then(post => {
		post.like++;
		post.save().then(() => {
			res.json({status: "SUCCESS"});
		}).catch(err => {
			if(err) console.log(err);
			return res.sendStatus(500);
		});
	}).catch(err => {
		console.log(err);
		return res.sendStatus(500);
	});
});

router.post('/del', function(req, res, next) {
	var post_id = req.body.post_id;

	passport.authenticate('jwt', {session: false}, (err, user, info) => {
		if(err) return res.sendStatus(500);		
		if(user) {
			models.Post.destroy({
				where: {
					post_id: post_id, 
					author: String(user.user_id)
				}
			}).then(() => {
				return res.redirect('/');
			}).catch(err => {
				if(err) console.log(err);
				return res.sendStatus(500);
			});
		}
		else
			return res.sendStatus(401);
	})(req, res, next);
});

router.post('/modify', function(req, res, next) {
	var post_id = req.body.post_id;
	var contents = req.body.contents;	
	
	passport.authenticate('jwt', {session: false}, (err, user, info) => {
		if(err) return res.sendStatus(500);
		if(user) {
			models.Post.findOne({
				where: {
					post_id: post_id,
					author: String(user.user_id)
			}}).then(post => {
				if(post) {
					post.contents = contents;
					post.save()
					.then(() => {
						return res.json({status: "SUCCESS"});
					}).catch(err => {
						if(err) console.log(err);
						return res.json({status: "error"});
					});
				} else {
					return res.json({status: "unAuthorized"});
				}
			}).catch(err => {
				if(err) console.log(err);
				return res.json({status: "error"});
			});		
		}
		else
			return res.json({status: "unAuthorized"});
	})(req, res);
});

router.post('/comment', (req, res, next) => {
	console.log(req.body);
	passport.authenticate('jwt', {session: false}, async (err, user, info) => {
		if(err){
			console.log(err);
			return res.sendStatus(500);
		} 
		const t = await models.sequelize.transaction();
		let user_id = '비 로그인 유저';
		let date = Date.now();	
		if(user)
			user_id = user.user_id;
		try {
			const comment = await models.Comment.create({
				author: user_id,
				comment: req.body.comment,
				updatedAt: date,
				createdAt: date
			}, {transaction: t});

			const post = await models.Post.findOne({
				where: {
				  post_id: req.body.post_id
				},
				transaction: t 
			  });

			console.log("type"+typeof post.comment);

			await post.update({
				comments: models.sequelize.fn('array_append', models.sequelize.col('comments'), comment.comment_id)
			}, {
				where: {
					post_id: req.body.post_id
					},
					transaction: t
			});
			  
			await t.commit();
		} catch(err) {
			console.log(err);
			await t.rollback();
		}

		if(user) {
			return res.render('index', {name: user.user_id, picture: '/images/user.png'});
		}
		else{
			return res.render('index', {name: '비로그인 유저', picture: '/images/user.png'});
		}			
	})(req, res, next);
});

router.post('/comment_modify', (req, res)=>{
	var comment_id = req.body.comment_id;
	var comment = req.body.comment;	
	
	passport.authenticate('jwt', {session: false}, (err, user, info) => {
		if(err) return res.sendStatus(500);
		if(user) {
			models.Comment.findOne({
				where: {
					comment_id: comment_id,
					author: String(user.user_id)
			}}).then(result => {
				if(result) {
					result.comment = comment;
					result.save()
					.then(() => {
						return res.json({status: "SUCCESS"});
					}).catch(err => {
						if(err) console.log(err);
						return res.json({status: "error"});
					});
				} else {
					return res.json({status: "unAuthorized"});
				}
			}).catch(err => {
				if(err) console.log(err);
				return res.json({status: "error"});
			});		
		}
		else
			return res.json({status: "unAuthorized"});
	})(req, res);
});

module.exports = router;
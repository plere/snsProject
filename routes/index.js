var express = require('express');
const passport = require('passport');
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
	models.Post.findAll().then(results => {		
		res.json(results);
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
				return res.json({status: "SUCCESS"});
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

module.exports = router;
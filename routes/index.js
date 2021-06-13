var express = require('express');
var router = express.Router();
var Posts = require("../models/post");
var Likes = require("../models/like");
var ObjectId = require('mongoose').Types.ObjectId;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('Public/Home.hbs', { layout: "Layouts/HomeLayout.hbs", title: 'Home', Home: true });
});

router.get('/contact', function(req, res, next) {
  res.render('Public/Contact.hbs', { layout: "Layouts/HomeLayout.hbs", title: 'Contact Us', Contact: true });
});

router.get('/login', function(req, res, next) {
  res.render('Public/Login.hbs', { layout: "Layouts/LoginLayout.hbs", title: 'Login/Register' });
});

router.get('/feed', function(req, res, next) {
  res.render('Panel/Feed.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Feed', Feed: true });
});

router.get('/timeline', function(req, res, next) {
  res.render('Panel/Timeline.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Timeline', Timeline: true });
});

router.get('/settings', function(req, res, next) {
  res.render('Panel/EditProfile.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Edit Profile', Settings: true });
});

router.get('/payment', function(req, res, next) {
  res.render('Panel/Payment.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Payment'});
});

router.get('/post', function(req, res, next) {
  res.render('Panel/Post.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Post', Post: true });
});

router.get('/testing', function(req, res, next) {
  // var newLike = new Likes({
  //   userid: "000000000",
  //   postid: new ObjectId("60c3702625a3512a24cc4584")
  // });
  // newLike.save(function (err) {
  //   if (err) throw err;
  //   res.send();
  // });
  // var newPost = new Posts({
  //   text: "this is the 3rd test"
  // });
  // newPost.save(function (err) {
  //   if (err) throw err;
  //   res.send();
  // });
});
router.get('/likes', function(req, res, next) {
  Posts.aggregate([
    {
      $lookup: {
        from: "likes",
        localField: "_id",    // field in the orders collection
        foreignField: "postid",  // field in the items collection
        as: "likes"
      }
    },
    {
      $project: {
        "text": "$text",
        "count": {"$size": "$likes.userid"},
        "isLiked": { "$in": ["0000000050", "$likes.userid"] },
        "mylike": {$filter: {
            input: '$likes',
            as: 'mylike',
            cond: {$eq: ['$$mylike.userid', '0000000050']}
          }},
      }
    }
  ], function (err, posts) {
    res.send(posts);
  });
});


module.exports = router;

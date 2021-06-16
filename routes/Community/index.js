var express = require('express');
var router = express.Router();
var Users = require("../../models/users");
var {authUser} = require('../../config/middlewares');

/* GET home page. */
router.get('/', authUser, function(req, res, next) {
  res.redirect("/community/feed");
});

router.get('/feed', authUser, function(req, res, next) {
  res.render('Panel/Feed.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Feed', Feed: true });
});

router.get('/timeline', authUser, async function(req, res, next) {
  var userInfo = await Users.findOne({email: req.session.email});
  res.render('Panel/Timeline.hbs', {
    layout: "Layouts/PanelLayout.hbs",
    title: 'Timeline',
    Timeline: true,
    userInfo: userInfo
  });
});

router.get('/settings', authUser, function(req, res, next) {
  res.render('Panel/EditProfile.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Edit Profile', Settings: true });
});

router.get('/payment', authUser, function(req, res, next) {
  res.render('Panel/Payment.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Payment'});
});

router.get('/post', authUser, function(req, res, next) {
  res.render('Panel/Post.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Post', Post: true });
});

// router.get('/testing', function(req, res, next) {
//   // var newLike = new Likes({
//   //   userid: "000000000",
//   //   postid: new ObjectId("60c3702625a3512a24cc4584")
//   // });
//   // newLike.save(function (err) {
//   //   if (err) throw err;
//   //   res.send();
//   // });
//   // var newPost = new Posts({
//   //   text: "this is the 3rd test"
//   // });
//   // newPost.save(function (err) {
//   //   if (err) throw err;
//   //   res.send();
//   // });
// });
// router.get('/likes', function(req, res, next) {
//   Posts.aggregate([
//     {
//       $lookup: {
//         from: "likes",
//         localField: "_id",    // field in the orders collection
//         foreignField: "postid",  // field in the items collection
//         as: "likes"
//       }
//     },
//     {
//       $project: {
//         "text": "$text",
//         "count": {"$size": "$likes.userid"},
//         "isLiked": { "$in": ["0000000050", "$likes.userid"] },
//         "mylike": {$filter: {
//             input: '$likes',
//             as: 'mylike',
//             cond: {$eq: ['$$mylike.userid', '0000000050']}
//           }},
//       }
//     }
//   ], function (err, posts) {
//     res.send(posts);
//   });
// });

module.exports = router;

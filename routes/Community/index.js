var express = require('express');
var router = express.Router();
var Users = require("../../models/users");
var DeletedUsers = require("../../models/deleted_users");
var {authUser} = require('../../config/middlewares');
var ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', authUser, function (req, res, next) {
    res.redirect("/community/feed");
});
router.get('/feed', authUser, async function (req, res, next) {
    var recomend_users = await Users.find({email: {$ne: req.session.email}}).sort({'registerDate': -1}).limit(4);

    res.render('Panel/Feed.hbs', {
        layout: "Layouts/PanelLayout.hbs",
        title: 'Feed',
        Feed: true,
        recommendedUsers: recomend_users
    });
});
router.get('/timeline', authUser, async function (req, res, next) {
    var userInfo = await Users.findOne({email: req.session.email});
    res.render('Panel/Timeline.hbs', {
        layout: "Layouts/PanelLayout.hbs",
        title: 'Timeline',
        Timeline: true,
        userInfo: userInfo
    });
});
router.get('/settings', authUser, async function (req, res, next) {
    var userInfo = await Users.findOne({email: req.session.email});
    res.render('Panel/EditProfile.hbs', {
        layout: "Layouts/PanelLayout.hbs",
        title: 'Settings',
        Settings: true,
        userInfo: userInfo,
        failureError: req.flash('failureError'),
        successMsg: req.flash('successMsg')
    });
});
router.get('/payment', authUser, function (req, res, next) {
    res.render('Panel/Payment.hbs', {layout: "Layouts/PanelLayout.hbs", title: 'Payment'});
});
router.get('/post', authUser, function (req, res, next) {
    res.render('Panel/Post.hbs', {layout: "Layouts/PanelLayout.hbs", title: 'Post', Post: true});
});
router.get('/delete-account/:id', authUser, async function (req, res, next) {
    var userData = await Users.findOne({_id: new ObjectId(req.params.id)});
    var newUser = new DeletedUsers({
        userData: userData
    });
    newUser.save(function (err) {
        if (err) throw err;
        Users.deleteMany({_id: new ObjectId(req.params.id)}, function (err, resp) {
            res.redirect("/logout");
        });
    });
});

router.post('/update-personal-info', function (req, res, next) {
    var query = {_id: new ObjectId(req.body.userId)};
    if (req.session.editable) {
        var updateInfo = {
            $set: {
                fullName: req.body.fullName,
                email: req.body.email,
                firstName: req.body.fullName.split(" ")[0],
                aboutYou: req.body.aboutYou,
                website: req.body.website,
                facebook: req.body.facebook,
                twitter: req.body.twitter,
                instagram: req.body.instagram,
                youtube: req.body.youtube
            }
        };
        Users.updateMany(query, updateInfo, function (err, result) {
            if (err) throw err;
            req.session.fullName = req.body.fullName
            req.session.firstName = req.body.fullName.split(" ")[0]
            req.session.email = req.body.email
            req.flash('successMsg', 'Επιτυχής ενημέρωση!');
            res.redirect("/community/settings");
        });
    } else {
        var updateInfo = {
            $set: {
                aboutYou: req.body.aboutYou,
                website: req.body.website,
                facebook: req.body.facebook,
                twitter: req.body.twitter,
                instagram: req.body.instagram,
                youtube: req.body.youtube
            }
        };
        Users.updateMany(query, updateInfo, function (err, result) {
            if (err) throw err;
            req.flash('successMsg', 'Επιτυχής ενημέρωση!');
            res.redirect("/community/settings");
        });
    }
});
router.post('/update-username', async function (req, res, next) {
    var user = await Users.findOne({username: req.body.username.split('@')[1]});
    if (!user) {
        var query = {_id: new ObjectId(req.body.userId)};
        var updateInfo = {
            $set: {
                username: req.body.username.split('@')[1]
            }
        };
        Users.updateMany(query, updateInfo, function (err, result) {
            if (err) throw err;
            req.flash('successMsg', 'Επιτυχής ενημέρωση!');
            res.redirect("/community/settings");
        });
    } else {
        res.redirect("/community/settings");
    }
});
router.post('/change-password', async function (req, res, next) {
    var oldPassword = await Users.findOne({_id: new ObjectId(req.body.userid)});
    var query = {_id: new ObjectId(req.body.userid)};
    if (req.body.newPassword == req.body.RepNewPassword) {
        bcrypt.compare(req.body.oldPassword, oldPassword.password, function (err, response) {
            if (response === true) {
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
                        var updateInfo = {
                            $set: {
                                password: hash
                            }
                        };
                        Users.updateMany(query, updateInfo, function (err, result) {
                            if (err) throw err;
                            req.flash('successMsg', 'Ο κωδικός πρόσβασης άλλαξε με επιτυχία!');
                            res.redirect("/community/settings");
                        });
                    });
                });
            } else {
                req.flash('failureError', 'Λανθασμένος παλιός κωδικός!');
                res.redirect("/community/settings");
            }
        });
    } else {
        req.flash('failureError', 'Οι κωδικοί δεν ταιριάζουν μεταξύ τους!');
        res.redirect("/community/settings");
    }
});
router.post('/check-username', async function (req, res, next) {
    var username = await Users.findOne({username: req.body.username.split('@')[1]});
    if (username) {
        res.send({exist: true})
    } else {
        res.send({exist: false})
    }
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

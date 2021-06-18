var express = require('express');
var router = express.Router();
var Users = require("../../models/users");
var Likes = require("../../models/like");
var DeletedUsers = require("../../models/deleted_users");
var Posts = require("../../models/post");
var {authUser} = require('../../config/middlewares');
var ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcrypt');
require('dotenv').config();
var multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
var crypto = require('crypto');
var path = require('path');

/*AWS UPLOAD IMG*/
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const filters = (req, file, cb) => {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        cb('Μη επιτρεπτός τύπος αρχείου!');
    } else {
        cb(null, true);
    }
}
var uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: process.env.BUCKET_NAME,
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '_' + crypto.createHash('md5').update(JSON.stringify(new Date().getTime())).digest("hex"))
        }
    }),
    fileFilter: filters,
    limits: {fileSize: 5242880}
}).single('imageUpload');  //5MB


/* GET home page. */
router.get('/', authUser, function (req, res, next) {
    res.redirect("/community/feed");
});
router.get('/feed', authUser, async function (req, res, next) {
    var recomend_users = await Users.find({_id: {$ne: new ObjectId(req.session.userID)}}).sort({'registerDate': -1}).limit(4);
    var feed = await Posts.aggregate([
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
                "postText": "$text",
                "postImage": "$image",
                "createdDate": "$createdDate",
                "authorName": "$author.fullName",
                "authorUsername": "$author.username",
                "authorAvatar": "$author.avatar",
                "countReactions": {"$size": "$likes"},
                "isReaction": {"$in": [req.session.userID, "$likes.userID"]},
                "myReaction": {
                    $filter: {
                        input: '$likes',
                        as: 'myReaction',
                        cond: {$eq: ['$$myReaction.userID', req.session.userID]}
                    }
                },
            }
        }
    ]);
    res.render('Panel/Feed.hbs', {
        layout: "Layouts/PanelLayout.hbs",
        title: 'Feed',
        Feed: true,
        recommendedUsers: recomend_users,
        posts: feed
    });
});
router.get('/timeline', authUser, async function (req, res, next) {
    var userInfo = await Users.findOne({_id: new ObjectId(req.session.userID)});
    var feed = await Posts.aggregate([
        {
            $match: {'author._id': new ObjectId(userInfo._id)}
        },
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
                "postText": "$text",
                "postImage": "$image",
                "createdDate": "$createdDate",
                "authorName": "$author.fullName",
                "authorUsername": "$author.username",
                "authorAvatar": "$author.avatar",
                "countReactions": {"$size": "$likes"},
                "isReaction": {"$in": [req.session.userID, "$likes.userID"]},
                "myReaction": {
                    $filter: {
                        input: '$likes',
                        as: 'myReaction',
                        cond: {$eq: ['$$myReaction.userID', req.session.userID]}
                    }
                },
            }
        }
    ]);
    res.render('Panel/Timeline.hbs', {
        layout: "Layouts/PanelLayout.hbs",
        title: 'Timeline',
        Timeline: true,
        userInfo: userInfo,
        posts: feed
    });
});
router.get('/timeline/:username', async function (req, res, next) {
    var userInfo = await Users.findOne({username: req.params.username.split("@")[1]});
    if(req.session.userID == userInfo._id){
        res.redirect("/community/timeline");
    }else {
        var feed = await Posts.aggregate([
            {
                $match: {'author._id': new ObjectId(userInfo._id)}
            },
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
                    "postText": "$text",
                    "postImage": "$image",
                    "createdDate": "$createdDate",
                    "authorName": "$author.fullName",
                    "authorUsername": "$author.username",
                    "authorAvatar": "$author.avatar",
                    "countReactions": {"$size": "$likes"},
                    "isReaction": {"$in": [new ObjectId(req.session.userID), "$likes.user.userID"]},
                    "myReaction": {
                        $filter: {
                            input: '$likes',
                            as: 'myReaction',
                            cond: {$eq: ['$$myReaction.user.userID', new ObjectId(req.session.userID)]}
                        }
                    },"isReaction": {"$in": [req.session.userID, "$likes.userID"]},
                    "myReaction": {
                        $filter: {
                            input: '$likes',
                            as: 'myReaction',
                            cond: {$eq: ['$$myReaction.userID', req.session.userID]}
                        }
                    },
                }
            }
        ]);
        res.render('Panel/UserProfile.hbs', {
            layout: "Layouts/PanelLayout.hbs",
            title: userInfo.fullName,
            Timeline: true,
            userInfo: userInfo,
            posts: feed
        });
    }
});
router.get('/settings', authUser, async function (req, res, next) {
    var userInfo = await Users.findOne({_id: new ObjectId(req.session.userID)});
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
router.post('/change-avatar', async function (req, res, next) {
    uploadS3(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            req.flash("failureError", err.message);
            res.redirect("/community/settings");
        } else if (err) {
            req.flash("failureError", JSON.stringify(err));
            res.redirect("/community/settings");
        } else {
            var itemImg;
            if (req.file) {
                if (req.body.prevImg !== process.env.DEFAULT_IMG) {
                    var params = {Bucket: process.env.BUCKET_NAME, Key: req.body.prevImg.split('.com/')[1]};
                    s3.deleteObject(params, function (err, data) {
                        if (err) console.log(err, err.stack);  // error
                    });
                }
                itemImg = req.file.location;
            } else {
                itemImg = req.body.prevImg;
            }
            var userInfo = await Users.findOne({_id: new ObjectId(req.body.userId)});
            if (userInfo) {
                var query = {_id: new ObjectId(req.body.userId)};
                var updateInfo = {
                    $set: {
                        avatar: itemImg
                    }
                };
                await Posts.updateMany({'author._id': new ObjectId(req.body.userId)}, {$set: {
                        'author.avatar': itemImg
                    }});
                Users.updateMany(query, updateInfo, function (err, result) {
                    if (err) throw err;
                    req.session.avatar = itemImg;
                    req.flash('successMsg', 'Επιτυχής ενημέρωση!');
                    res.redirect("/community/settings");
                });
            }
        }
    });
});
router.post('/createPost', async function (req, res, next) {
    var authorData = await Users.findOne({_id: new ObjectId(req.session.userID)});
    if (authorData) {
        uploadS3(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                req.flash("failureError", err.message);
                res.redirect("/community/feed");
            } else if (err) {
                req.flash("failureError", JSON.stringify(err));
                res.redirect("/community/feed");
            } else {
                if (req.file) {
                    var newPost = new Posts({
                        author: {
                            _id: authorData._id,
                            fullName: authorData.fullName,
                            username: authorData.username,
                            avatar: authorData.avatar
                        },
                        image: req.file.location,
                        text: req.body.textPost
                    });
                    newPost.save(function (err) {
                        if (err) throw err;
                        res.redirect("/community");
                    });
                }else{
                    var newPost = new Posts({
                        author: {
                            _id: authorData._id,
                            fullName: authorData.fullName,
                            username: authorData.username,
                            avatar: authorData.avatar
                        },
                        text: req.body.textPost
                    });
                    newPost.save(function (err) {
                        if (err) throw err;
                        res.redirect("/community");
                    });
                }
            }
        });
    } else {
        res.redirect("/community");
    }
});
router.post('/createReaction', async function (req, res, next) {
    var like = await Likes.findOne({
        userID: req.session.userID,
        postid: new ObjectId(req.body.postid)
    });
    if (!like) {
        var newLike = new Likes({
            userID: req.session.userID,
            type: req.body.type,
            postid: new ObjectId(req.body.postid)
        });
        newLike.save(function (err) {
            if (err) throw err;
            res.send({status: 'success'});
        });
    } else {
        var query = {postid: new ObjectId(req.body.postid)};
        var updateInfo = {
            $set: {
                type: req.body.type
            }
        };
        Likes.updateMany(query, updateInfo, function (err, result) {
            if (err) throw err;
            res.send({status: 'success'});
        });
    }
});
router.post('/deleteReaction', async function (req, res, next) {
    Likes.deleteMany({
        userID: req.session.userID,
        postid: new ObjectId(req.body.postid),
        type: req.body.type
    }, function (err){
        res.send({status: 'success'});
    });
});

module.exports = router;

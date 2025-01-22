var express = require('express');
var router = express.Router();
const passport = require("passport");
var Users = require("../../models/users");
const bcrypt = require('bcryptjs');
var {skipRouter} = require('../../config/middlewares');
require('dotenv').config();
var ObjectId = require('mongoose').Types.ObjectId;
const sgMail = require('@sendgrid/mail');
const EmailTemplate = require('./emailTemplate');
var {v4} = require('uuid');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('Public/Home.hbs', {layout: "Layouts/HomeLayout.hbs", title: 'Home', Home: true});
});
router.get('/contact', function (req, res, next) {
    res.render('Public/Contact.hbs', {layout: "Layouts/HomeLayout.hbs", title: 'Contact Us', Contact: true});
});
router.get('/login', skipRouter, function (req, res, next) {
    res.render('Public/Login.hbs', {
        layout: "Layouts/LoginLayout.hbs",
        title: 'Login/Register',
        msg: req.flash('credentialsError'),
        successMsg: req.flash('successMsg')
    });
});
router.get('/google/user', skipRouter, passport.authenticate('googleUser', {
    scope: ['profile', 'email'],
    prompt: 'consent'
}));
router.get('/google/user/callback', passport.authenticate('googleUser', {failureRedirect: '/error'}), function (req, res) {
    if (req.user.error === "inactive") {
        req.flash('credentialsError', 'Ο λογαριασμός δεν είναι ενεργοποιημένος. Ελέγξτε τα email σας.');
        req.logout();
        res.redirect("/login");
    } else {
        var userData = req.user._doc;
        console.log(userData)
        req.session.authUser = true;
        req.session.fullName = userData.fullName
        req.session.firstName = userData.firstName
        req.session.avatar = userData.avatar
        req.session.email = userData.email
        req.session.userID = userData._id
        if (req.user.exist == true) {
            req.flash('existUser', userData.email);
        }
        res.redirect("/community/feed");
    }
});
router.get('/facebook/user', skipRouter, passport.authenticate('facebookUser', {
    scope: ["email"]
}));
router.get('/facebook/user/callback', passport.authenticate('facebookUser', {failureRedirect: '/error'}), function (req, res) {
    if (req.user.error === "inactive") {
        req.flash('credentialsError', 'Ο λογαριασμός δεν είναι ενεργοποιημένος. Ελέγξτε τα email σας.');
        req.logout();
        res.redirect("/login");
    } else {
        var userData = req.user._doc;
        req.session.authUser = true;
        req.session.fullName = userData.fullName
        req.session.firstName = userData.firstName
        req.session.avatar = userData.avatar
        req.session.email = userData.email
        req.session.userID = userData._id
        if (req.user.exist == true) {
            req.flash('existUser', userData.email);
        }
        res.redirect("/community/feed");
    }
});
router.get('/verify', async function (req, res, next) {
    var givenEmail = req.query.email;
    var token = req.query.token;
    var hash = req.query.hash;
    var user = await Users.findOne({_id: new ObjectId(token), email: givenEmail, socialID: hash, active: false});

    if (user) {
        var query = {_id: new ObjectId(token)};
        var updateInfo = {
            $set: {
                active: true
            }
        };
        Users.updateMany(query, updateInfo, function (err, result) {
            if (err) throw err;
            req.flash('successMsg', 'Ο λογαριασμός σας ενεργοποιήθηκε!');
            res.redirect("/login");
        });
    } else {
        req.flash('credentialsError', 'Δεν βρέθηκε ο χρήστης!');
        res.redirect("/login");
    }

});
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/login');
    req.session.destroy();
});
router.get('/forgot', skipRouter, function (req, res, next) {
    res.render('Public/Forgot.hbs', {
        layout: "Layouts/LoginLayout.hbs",
        title: 'Ξέχασα τον κωδικό μου',
        msg: req.flash('credentialsError'),
        successMsg: req.flash('successMsg')
    });
});
router.get('/reset', async function (req, res, next) {
    var email = req.query.email;
    var hash = req.query.hash;
    var token = req.query.token;

    var user = await Users.findOne({email: email, socialID: hash, _id: new ObjectId(token)});
    if (user) {
        res.render('Public/ResetPassword.hbs', {
            layout: "Layouts/LoginLayout.hbs",
            title: 'Αλλαγή κωδικόυ',
            email: user.email,
            socialID: user.socialID
        });
    } else {
        req.flash('credentialsError', 'Ο λογαριασμός δεν βρέθηκε!');
        res.redirect("/forgot");
    }
});

router.post('/register', async function (req, res, next) {
    var user = await Users.findOne({email: req.body.email});
    if (!user) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.password, salt, async function (err, hash) {
                var newUser = new Users({
                    fullName: req.body.fname + " " + req.body.lname,
                    firstName: req.body.fname,
                    password: hash,
                    email: req.body.email,
                    username: req.body.email.split("@")[0],
                    gender: req.body.gender,
                    socialID: v4(),
                    method: "custom",
                });
                await newUser.save();
                sgMail.setApiKey(process.env.SENDGRID_API);
                const msg = {
                    to: req.body.email,
                    from: 'delvagdel@gmail.com', // Verified sender
                    subject: 'Psybox | Επιβεβαίωση λογαριασμού',
                    html: EmailTemplate.activation(newUser._id, req.body.email, newUser.socialID)
                }
                sgMail
                    .send(msg)
                    .then(() => {
                        req.flash('successMsg', 'Σας έχει αποσταλεί email επιβεβαίωσης!');
                        res.redirect("/login");
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            });
        });
    } else {
        req.flash('credentialsError', 'Το email αυτό υπάρχει ήδη!');
        res.redirect("/login");
    }
});
router.post('/login', async function (req, res, next) {
    var loginPassword = req.body.password;
    const user = await Users.findOne({
        email: req.body.email
    });
    if (user) {
        if (user.active === true) {
            bcrypt.compare(loginPassword, user.password, function (err, response) {
                if (response === true) {
                    req.session.authUser = true;
                    req.session.fullName = user.fullName;
                    req.session.firstName = user.firstName;
                    req.session.avatar = user.avatar;
                    req.session.email = user.email;
                    req.session.editable = true;
                    req.session.userID = user._id;
                    res.redirect("/community");  //Success Login
                } else {
                    req.flash('credentialsError', 'Λάθος email ή κωδικός πρόσβασης. Προσπαθήστε ξανά!');
                    res.redirect("/login");    //Wrong Credentials
                }
            });
        } else {
            req.flash('credentialsError', 'Ο λογαριασμός δεν είναι ενεργοποιημένος. Ελέγξτε τα email σας.');
            res.redirect("/login");
        }
    } else {
        req.flash('credentialsError', 'Ο χρήστης δεν βρέθηκε.');
        res.redirect("/login");
    }
});
router.post('/forgot', async function (req, res, next) {
    Users.findOne({email: req.body.email, method: "custom"}, function (err, user) {
        if (user) {
            var link = 'https://' + req.get('host') + "/reset?token=" + user._id + "&email=" + user.email + "&hash=" + user.socialID;
            sgMail.setApiKey(process.env.SENDGRID_API);
            const msg = {
                to: req.body.email,
                from: 'delvagdel@gmail.com', // Verified sender
                subject: 'Psybox | Επαναφορά κωδικού πρόσβασης',
                html: EmailTemplate.forgotPassword(link)
            }
            sgMail
                .send(msg)
                .then(() => {
                    req.flash('successMsg', 'Έχει αποστολεί email για την επαναφορά του κωδικού σας!');
                    res.redirect("/forgot");
                })
                .catch((error) => {
                    console.error(error)
                    res.status(400).send();
                })
        } else {
            req.flash('credentialsError', 'Ο λογαριασμός δεν βρέθηκε.');
            res.redirect("/forgot");
        }
    });
});
router.post('/changePassword', async function (req, res, next) {

    //WARNING FOR SECURITY REASONS
    var user = await Users.findOne({email: req.body.email, socialID: req.body.socialID});
    if (user) {
        bcrypt.hash(req.body.newpassword, 10, async function (err, hashPassword) {
            var query = {email: req.body.email};
            var updatePassword = {
                $set: {
                    password: hashPassword,
                    socialID: v4()
                }
            };
            await Users.updateMany(query, updatePassword);
            req.flash('successMsg', 'Ο κωδικός πρόσβασης σας άλλαξε!');
            res.redirect("/login");
        });
    } else {
        req.flash('credentialsError', 'Ο λογαριασμός δεν βρέθηκε!');
        res.redirect("/forgot");
    }
});
module.exports = router;

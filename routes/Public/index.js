var express = require('express');
var router = express.Router();
const passport = require("passport");
var {skipRouter} = require('../../config/middlewares');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('Public/Home.hbs', { layout: "Layouts/HomeLayout.hbs", title: 'Home', Home: true });
});
router.get('/contact', function(req, res, next) {
  res.render('Public/Contact.hbs', { layout: "Layouts/HomeLayout.hbs", title: 'Contact Us', Contact: true });
});
router.get('/login', skipRouter, function(req, res, next) {
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
  if(req.user.error === "inactive"){
    req.flash('credentialsError', 'Ο λογαριασμός δεν είναι ενεργοποιημένος');
    req.logout();
    res.redirect("/login");
  }else{
    req.session.authUser = true;
    req.session.fullName = req.user.displayName
    req.session.firstName = req.user.name.givenName
    req.session.avatar = req.user._json.picture
    req.session.email = req.user._json.email
    req.session.userID = req.user.id
    res.redirect("/community");
  }
});

router.get('/facebook/user', skipRouter, passport.authenticate('facebookUser', {
  scope: ["email"]
}));
router.get('/facebook/user/callback', passport.authenticate('facebookUser', {failureRedirect: '/error'}), function (req, res) {
  if(req.user.error === "inactive"){
    req.flash('credentialsError', 'Ο λογαριασμός δεν είναι ενεργοποιημένος');
    req.logout();
    res.redirect("/login");
  }else{
    req.session.authUser = true;
    req.session.fullName = req.user.displayName
    req.session.firstName = req.user.name.givenName
    req.session.avatar = req.user._json.picture.data.url
    req.session.email = req.user._json.email
    req.session.userID = req.user.id
    res.redirect("/community");
  }
});

router.get('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/login');
  req.session.destroy();
});

module.exports = router;

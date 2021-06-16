var express = require('express');
var router = express.Router();
const passport = require("passport");
var Users = require("../../models/users");
const bcrypt = require('bcrypt');
var {skipRouter} = require('../../config/middlewares');
require('dotenv').config();
var ObjectId = require('mongoose').Types.ObjectId;
const sgMail = require('@sendgrid/mail');
const EmailTemplate = require('./emailTemplate');
var {v4} = require('uuid');


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
router.get('/verify', async function (req, res, next){
  var givenEmail = req.query.email;
  var id = req.query.id;
  var hash = req.query.id;

  console.log(givenEmail, token);
  var user = await Users.findOne({_id: new ObjectId(token), email: givenEmail, hash: hash, active: false});

  if(user){
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
  }else{
    req.flash('credentialsError', 'Δεν βρέθηκε ο χρήστης2!');
    res.redirect("/login");
  }

});
router.get('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/login');
  req.session.destroy();
});

router.post('/register', async function (req,res, next){
  var user = await Users.findOne({email: req.body.email});
  if (!user) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        var newUser = new Users({
          fullName: req.body.fname + " " + req.body.lname,
          firstName: req.body.fname,
          password: hash,
          email: req.body.email,
          username: req.body.email.split("@")[0],
          gender: req.body.gender,
          hash: v4(),
          method: "custom",
        });
        newUser.save(function (err) {
          if (err) throw err;
          var tokenID = newUser._id;
          sgMail.setApiKey(process.env.SENDGRID_API);
          const msg = {
            to: req.body.email,
            from: 'delvagdel@gmail.com', // Verified sender
            subject: 'Psybox | Επιβεβαίωση λογαριασμού',
            html: EmailTemplate.activation(tokenID, req.body.email)
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
    });
  }else{
    req.flash('credentialsError', 'Το email αυτό υπάρχει ήδη!');
    res.redirect("/login");
  }
});
router.post('/login', async function (req,res, next){
  var loginPassword = req.body.password;
  const user = await Users.findOne({
    email: req.body.email
  });
  if (user) {
    if (user.active === true) {
      bcrypt.compare(loginPassword, user.password, function (err, response) {
        if (response === true) {
          req.session.authUser = true;
          req.session.fullName = user.fullName
          req.session.firstName = user.firstName
          req.session.avatar = user.avatar
          req.session.email = user.email
          req.session.userID = user._id
          res.redirect("/community");  //Success Login
        } else {
          req.flash('credentialsError', 'Λάθος email ή κωδικός πρόσβασης. Προσπαθήστε ξανά!');
          res.redirect("/login");    //Wrong Credentials
        }
      });
    } else {
      req.flash('credentialsError', 'Ο λογαριασμός δεν είναι ενεργοποιημένος');
      res.redirect("/login");
    }
  } else {
    req.flash('credentialsError', 'Ο χρήστης δεν βρέθηκε.');
    res.redirect("/login");
  }
});

module.exports = router;

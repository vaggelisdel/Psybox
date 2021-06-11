var express = require('express');
var router = express.Router();

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

router.get('/timeline1', function(req, res, next) {
  res.render('Panel/Timeline1.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Timeline', Timeline: true });
});

router.get('/post', function(req, res, next) {
  res.render('Panel/Post.hbs', { layout: "Layouts/PanelLayout.hbs", title: 'Post', Post: true });
});
module.exports = router;

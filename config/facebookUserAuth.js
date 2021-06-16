var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
var Users = require('../models/users');

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (id, done) {
    done(null, id);
});

const FACEBOOK_CLIENT_ID = '336938227821627';
const FACEBOOK_CLIENT_SECRET = 'e2b14be72052dfaf64232054b9907ea9';
passport.use('facebookUser',new FacebookStrategy({
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        callbackURL: "/facebook/user/callback",
        profileFields: ['id', 'displayName', 'name', 'email', 'gender', 'picture.type(large)', 'locale'],
        proxy: true
    },
    async function (accessToken, refreshToken, profile, done) {
        var user = await Users.findOne({email: profile._json.email, socialID: profile.id});
        if (!user) {
            var newUser = new Users({
                socialID: profile.id,
                fullName: profile.displayName,
                email: profile._json.email,
                username: profile._json.email.split("@")[0],
                avatar: profile._json.picture.data.url,
                method: profile.provider,
                locale: profile._json.locale,
                active: true,
            });
            newUser.save(function (err) {
                if (err) throw err;
                return done(null, profile);
            });
        }else{
            if(user.active === false){
                return done(null, {error: "inactive"});
            }else{
                return done(null, profile);
            }
        }
    }
));


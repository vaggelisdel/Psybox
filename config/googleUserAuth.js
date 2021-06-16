var passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Users = require('../models/users');

passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const GOOGLE_CLIENT_ID = '802117457930-6vk2j2kkqfmakgs1h319hr4iq24ka38t.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'y_Je23G-FGzYfKICQ0csCh-L';
passport.use('googleUser', new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/google/user/callback",
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
                avatar: profile._json.picture,
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


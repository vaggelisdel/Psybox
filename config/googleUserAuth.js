var passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Users = require('../models/users');

passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const GOOGLE_CLIENT_ID = '899204019309-vh9shonk8bvjvndr9uihj81a33oc7op5.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use('googleUser', new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/google/user/callback",
        proxy: true
    },
    async function (accessToken, refreshToken, profile, done) {
        var user = await Users.findOne({email: profile._json.email});
        if (!user) {
            var newUser = new Users({
                socialID: profile.id,
                fullName: profile.displayName,
                firstName: profile.name.givenName,
                email: profile._json.email,
                username: profile._json.email.split("@")[0],
                avatar: profile.photos[0].value,
                method: profile.provider,
                locale: profile._json.locale,
                active: true,
            });
            await newUser.save();
            return done(null, {...newUser, exist: false});
        }else{
            if(user.active === false){
                return done(null, {error: "inactive"});
            }else if(user.method !== "google"){
                return done(null, {...user, exist: true});
            }else{
                return done(null, user);
            }
        }
    }
));


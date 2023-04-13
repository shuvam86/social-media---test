const passport= require('passport');
const keys= require('../config/keys');
const User= require('../models/user');
const InstagramStrategy= require('passport-instagram').Strategy;

passport.serializeUser(function (user,done) {
    done(null,user.id);
});

passport.deserializeUser(function (id,done) {
    User.findById(id,function(err,user) {
        done(err,user);
    });
});

passport.use(new InstagramStrategy({
    clientID: keys.InstagramClientID,
    clientSecret: keys.InstagramClientSecret,
    callbackURL: "/auth/instagram/callback",
    proxy: true
  },
  (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    }
));
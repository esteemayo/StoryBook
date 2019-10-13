const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: keys.GOOGLE_CLIENT_ID,
        clientSecret: keys.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        proxy: true
    }, (accessToken, refreshToken, profile, done) => {
        // console.log(accessToken);
        // console.log(profile);

        const newUser = {
            googleID: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            image: profile.photos[0].value
        }

        // Check existing user
        User.findOne({ googleID: profile.id })
            .then(user => {
                // Return user
                if (user) {
                    done(null, user);
                } else {
                    // Create new user
                    new User(newUser)
                        .save()
                        .then(user => done(null, user));
                }
            });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}
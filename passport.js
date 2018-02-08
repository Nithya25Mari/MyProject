const _ = require('lodash');
const passport = require('passport');
const request = require('request');

const LocalStrategy = require('passport-local').Strategy;

const User = require('../model/User');

passport.serializeUser((user, done) => {    
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'Email', passwordField: 'Password' }, (Email, Password, done) => {
   //console.log(Email,Password);
    User.findOne({ Email: Email.toLowerCase() }, (err, user) => {
        //console.log(err);
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { msg: `Email ${Email} not found.` });
           // alert("Email not found");
        }
        user.ComparePassword(Password, (err, isMatch) => {
            if (err) { return done(err); }
            if (isMatch) {
                return done(null, user);
            }
            return done(null, false, { msg: 'Invalid email or password.' });
        });
    });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {   
    if (req.isAuthenticated()) {
        return next();
    }
    res.json("notauthenticate");
    //console.log("notauthenticate");
};

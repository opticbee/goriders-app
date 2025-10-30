const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();

// --- Session setup ---
app.use(session({
    secret: 'your_secret_key', // Any secret you want
    resave: false,
    saveUninitialized: true,
}));

// --- Passport Middleware ---
app.use(passport.initialize());
app.use(passport.session());

// --- Passport serializeUser and deserializeUser ---
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});



passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:5000/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
    console.log('Google profile:', profile);

    // Here you normally check if user exists in your DB
    // If not, create new user
    const userData = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails && profile.emails[0].value,
        photo: profile.photos && profile.photos[0].value,
    };
    return done(null, userData);
}));

passport.use(new FacebookStrategy({
    clientID: 'YOUR_FACEBOOK_APP_ID',
    clientSecret: 'YOUR_FACEBOOK_APP_SECRET',
    callbackURL: 'http://localhost:5000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
},
(accessToken, refreshToken, profile, done) => {
    console.log('Facebook profile:', profile);

    const userData = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails && profile.emails[0].value,
        photo: profile.photos && profile.photos[0].value,
    };
    return done(null, userData);
}));


// Google Authentication Route
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Callback
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/dashboard.html'); // Redirect after successful login
    }
);

// Facebook Authentication Route
app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
);

// Facebook Callback
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/dashboard.html'); // Redirect after successful login
    }
);

// (Optional) Logout Route
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login.html');
    });
});

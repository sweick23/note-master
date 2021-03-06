const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('MY_API_KEY');



// load models
let User = require('../models/user');
let Note = require('../models/note');


// Register form
router.get('/register', (req, res) => {
    res.render('register');
});




// Register proccess
router.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;


    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'Passord is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) {
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save((err) => {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        const msg = {
                            to: req.body.email,
                            from: 'no-reply@notemaster.com',
                            subject: 'Welcome to NoteMaster',
                            html: '<p>Thank you ' + req.body.name + ' for signing up with NoteMaster</p>',

                        };
                        sgMail.send(msg);
                        console.log(msg);

                        req.flash('success', 'You are now registered and can log in');
                        res.redirect('/users/login');
                    }
                });
            });
        });

    }
});




// Login form
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/notes/home',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});



// logout
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

// homepage for when logged in


// access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}



module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');

//User Model
const User = require('../models/User');

//Home route
router.get('/', (req, res) => {
    res.render('index');
});


//sign in route
router.get('/signin',forwardAuthenticated ,(req, res) => {
    res.render('signin')
});

router.post('/signin', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/community',
        failureRedirect: '/signin',
        failureFlash: true,
    })(req, res, next);
}); 


//sign up route
router.get('/signup', forwardAuthenticated,(req, res) => {
    res.render('signup')
});

router.post('/signup', async (req, res) => {

    // check if any fields are empty
    if(req.body.username === '' || req.body.email === '' || req.body.password === '' || req.body.confirm === '') {
        res.redirect('/signup');
    }
    if(req.body.password.length < 8) {
        res.redirect('/signup');
    };
    if(req.body.password !== req.body.confirm) {
        res.redirect('/signup');
    }

    //saving user to database
    try{
        //check if email already exists
        const dbemail = await User.findOne({email: req.body.email});
        if(dbemail){
            throw new Error('Email already exists');
        }
        //hashpassword
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword
        });
        //save new user
        await newUser.save();
        //redirect to signin
        res.redirect('/signin');
    }
    catch{
        //render error page when failed
        res.render('signupError');
    }
});


// about us route
router.get('/about', (req, res) => {
    res.render('about-us');
});
//sitemap route
router.get('/sitemap', (req, res) => {
    res.render('sitemap');
});

//logout route
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

module.exports = router;
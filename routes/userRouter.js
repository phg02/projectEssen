const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post'); 
const AdoptionPost = require('../models/AdoptionPost');
const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');


//post profile route
router.get('/postprofile',ensureAuthenticated, async (req, res) => {
    let page = req.query.page || 0;

    try{
        let allPosts = await Post.find({author: req.user._id}).populate('author').where('deleted').equals(false).sort({dateCreated: -1}).exec();
        res.render('profile-post', {user: req.user, allPosts: allPosts, page: page});
    }
    catch(err){
        console.log(err);
    }
    
})

//seller profile route
router.get('/sellerprofile',ensureAuthenticated , async(req, res) => {
    try{
        let allAdoption = await AdoptionPost.find({author: req.user._id}).populate('author').sort({dateCreated: -1}).where('delete').equals(false).exec();
        res.render('profile-sell', {user: req.user, allAdoption: allAdoption})
        
    }
    catch(err){
        console.log(err);
    }
});

router.put('/deletepost/:id',ensureAuthenticated, async (req, res) => {
    try{
        await Post.findByIdAndUpdate(req.params.id, {deleted: true});
        res.redirect('/user/postprofile');
    }
    catch(err){
        console.log(err);
    }
});

module.exports = router;
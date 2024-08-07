const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated, ensureAuthenticatedAdmin} =require('../config/auth');

//User Model
const User = require('../models/User');
const { route } = require('./settingRouter');
const Post = require('../models/Post');
const AdoptionPost = require('../models/AdoptionPost');
const Like = require('../models/LikePost');
const Comment = require('../models/Comment');
//manage user
router.get('/users',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res) => {
    let query = User.find();
    if (req.query.search != null && req.query.search != '') {
        query = query.regex('username', new RegExp(req.query.search, 'i'));
    }
    if (req.query.sortby == 'Oldest user') {
        query = query.sort({dateCreated: 1});
    } else {
        query = query.sort({dateCreated: -1});
    }    
    try {
        const allUsers = await query.where('admin').equals('false').exec();
        res.render('adminUser', {user: req.user, allUsers: allUsers, search: req.query})
    } catch (err) {
        console.log(err);
    }
});

//manage post
router.get('/post',ensureAuthenticated, ensureAuthenticatedAdmin , async (req, res) => {
    let query = Post.find();
    let searchLink = '';
    let page = req.query.page || 0;
    if (req.query.search != null && req.query.search != '') {
        query = query.regex('title', new RegExp(req.query.search, 'i'));
        searchLink += '&search=' + req.query.search;
    }
    if (req.query.sortbyTime == 'Oldest posts') {
        query = query.sort({dateCreated: 1});
        searchLink  += '&sortbyTime=Oldest posts';
    } else {
        query = query.sort({dateCreated: -1});
        searchLink += '&sortbyTime=Newest posts';
    }
    if (req.query.sortbyStatus == 'Reported posts') {
        query = query.where('reported').equals(true);
        searchLink += '&sortbyStatus=Reported posts';
    }
    if (req.query.sortbyStatus == 'Deleted posts') {
        query = query.where('deleted').equals(true);
        searchLink += '&sortbyStatus=Deleted posts';
    }
    if (req.query.startDate != null && req.query.startDate != '') {
        query = query.where('dateCreated').gte(req.query.startDate);
        searchLink += '&startDate=' + req.query.startDate;
    }
    //function to get the true end date
    function trueEndDate(date) {
        let dateArray = date.split('-');
        dateArray[2] = Number(dateArray[2]) + 1;
        return dateArray.join('-');
    }
    if (req.query.endDate != null && req.query.endDate != '') {
        query = query.where('dateCreated').lte(trueEndDate(req.query.endDate));
        searchLink += '&endDate=' + req.query.endDate;
    }
    //modify above if needed
    try {
        const allPosts = await query.populate('author').skip(20 * page).limit(20).exec();
        res.render('admin' , {user: req.user, allPosts: allPosts, search: req.query, page: page, searchLink: searchLink})
    } catch (err) {
        console.log(err);
    }
});

//manage seeling post
router.get('/adoption',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res) => {
    let query = AdoptionPost.find().where('delete').equals(false).sort({dateCreated: -1});
    let searchLink = '';
    let page = req.query.page || 0;
    if (req.query.search != null && req.query.search != '') {
        query = query.regex('title', new RegExp(req.query.search, 'i'));
        searchLink += '&search=' + req.query.search;
    }
    if (req.query.sortby == 'Dog') {
        query = query.where('petType').equals('Dog');
        searchLink += '&sortby=Dog';
    }
    if (req.query.sortby == 'Cat') {
        query = query.where('petType').equals('Cat');
        searchLink += '&sortby=Cat';
    }
    try {
        const allPosts = await query.populate('author').skip(page * 12).limit(12).exec();
        res.render('adminAdopt', {user: req.user, allPosts: allPosts, search: req.query, petType: req.query, page: page, searchLink: searchLink})
    } catch (err) {
        console.log(err);
    }
})

//pet post for admin
router.get('/adoption/listing/:id',ensureAuthenticated, ensureAuthenticatedAdmin , async (req, res) => {
    try {
        const post = await AdoptionPost.findById(req.params.id).populate('author').exec();
        res.render('adminPet' , {user: req.user, post: post})
    } catch (err) {
        console.log(err);
    }
});

//admin user profile
router.get('/userprofile/:id',ensureAuthenticated, ensureAuthenticatedAdmin , async (req, res) => {
    try {
        const account = await User.findById(req.params.id);
        const allPosts = await Post.find().where('author').equals(req.params.id).where('deleted').equals(false).populate('author').sort({dateCreated: -1}).exec();
        const likes = await Like.find({user: req.params.id});
        const comments = await Comment.find({author: req.params.id}).populate('author').exec();
        res.render('adminPost' , {user: req.user, account: account, allPosts: allPosts, likes: likes, comments: comments})
    } catch (err) {
        console.log(err);
    }
});
//admin user profile sell
router.get('/sellprofile/:id',ensureAuthenticated, ensureAuthenticatedAdmin , async (req, res) => {
    try {
        const account = await User.findById(req.params.id);
        const allPosts = await AdoptionPost.find().where('author').equals(req.params.id).where('delete').equals(false).populate('author').sort({dateCreated: -1}).exec();
        res.render('adminSell' , {user: req.user, account: account, allPosts: allPosts})
    } catch (err) {
        console.log(err);
    }
});

//getting setting
router.get('/setting',ensureAuthenticated, ensureAuthenticatedAdmin ,(req, res) => {
    res.render('settingAdmin' , {user: req.user})
});

//change theme
router.put('/updatetheme',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res)=>{
    let user = await User.findById(req.user.id);
    if(req.body.switchTheme){
        user.theme = 'dark';
    }
    else{
        user.theme = 'light';
    }
    await user.save();
    res.redirect('/admin/setting');
})

//update password
router.put('/updatepassword',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res) => {
    try{
        //find user old password
        let userChange = await User.findById(req.user.id);
        //check if old password is correct
        if(await bcrypt.compare(req.body.oldPassword, userChange.password)){
            userChange.password = await bcrypt.hash(req.body.newPassword, 10);
           
        }
        else{
            throw new Error('wrong password');
        }
        //check if new password is empty
        if(req.body.newPassword === ''){
            throw new Error('New password cannot be empty');
        }
        //check if new password is less than 8 characters
        if(req.body.newPassword.length < 8){
            throw new Error('New password must be at least 8 characters');
        }
        //check if new password and confirm password match
        if(req.body.newPassword != req.body.confirmPassword){
            throw new Error('new passwords do not match');
        }
        //check if new password is same as old password
        if(req.body.oldPassword === req.body.newPassword){
            throw new Error('New password cannot be same as old');

        }
        await userChange.save();
        
        res.render('successSetting', {user: req.user, message: 'Password updated successfully'});
    }
    catch(err){
        res.render('settingError', {user: req.user ,error: err.message});
    }
    

});


router.delete('/deleteuser/:id',ensureAuthenticated, ensureAuthenticatedAdmin, async (req, res) => {
        try {
            const post = await Post.deleteMany({author: req.params.id});
            const adoptionPost = await AdoptionPost.deleteMany({author: req.params.id});
            const user = await User.deleteOne({_id: req.params.id});
            const comment = await Comment.deleteMany({author: req.params.id});
            res.redirect('/admin/users');
        }
        catch(err){
            console.log(err);
        }
});
//delete post by admin
router.put('/adoption/:id', ensureAuthenticated, async (req, res) => {
    try {
        let post = await AdoptionPost.findById(req.params.id).populate('author');
        if (post) {
            // post.delete = true; 
            post.delete = true;
            await post.save();
            res.redirect('/admin/adoption');
        } else {
            throw new Error('Post not found');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/adoption');
    }
    
});

router.put('/deletepost/:id',ensureAuthenticated, async (req, res) => {
    try{
        await Post.findByIdAndUpdate(req.params.id, {deleted: true});
        res.redirect('/admin/post');
    }
    catch(err){
        console.log(err);
    }
});


router.put('/deletepostprofile/:id',ensureAuthenticated, async (req, res) => {
    try{
        let post = await Post.findById(req.params.id).populate('author');
        post.deleted = true;
        await post.save();
        res.redirect('/admin/userprofile/' + post.author.id);
    }
    catch(err){
        console.log(err);
    }
});

//with image
router.get('/imgpost/:id/:origin',ensureAuthenticated, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id).populate('author').exec();
        const comments = await Comment.find({belongTo: req.params.id}).populate('author').exec();
        const likes = await Like.find({post: req.params.id});
        let location;
        if(req.params.origin == 'admin'){
            location = '/admin/post';
          }
          if(req.params.origin == 'userprofile'){
            location = '/admin/userprofile/' + post.author._id;
          }
          res.render('comment2admin', {user: req.user, post: post, comments: comments, likes: likes, location: location});
    }catch(err){
        console.log(err);
    }
})
//without image
router.get('/post/:id/:origin',ensureAuthenticated, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id).populate('author').exec();
        const comments = await Comment.find({belongTo: req.params.id}).populate('author').exec();
        const likes = await Like.find({post: req.params.id});
        let location;
        if(req.params.origin == 'admin'){
            location = '/admin/post';
          }
        if(req.params.origin == 'userprofile'){
            location = '/admin/userprofile/' + post.author._id;
          }
          res.render('commentadmin', {user: req.user, post: post, comments: comments, likes: likes, location: location});
    }catch(err){
        console.log(err);
    }
})

router.delete('/deletecomment/:id/:typepost/:postid/:origin',ensureAuthenticated, async (req, res) => {
    try{
        await Comment.findByIdAndDelete(req.params.id);
        if(req.params.origin == 'admin'){
            location = '/admin/post';
          }
        if(req.params.origin == 'userprofile'){
            location = '/userprofile'
        }
        res.redirect('/admin/' + req.params.typepost + '/' + req.params.postid+ location);  
    }
    catch(err){
        console.log(err);
    }
});

router.put('/sellprofiledelete/:id', ensureAuthenticated, async (req, res) => {
    try {
        let post = await AdoptionPost.findById(req.params.id).populate('author');
        if (post) {
            // post.delete = true; 
            post.delete = true;
            await post.save(); 
            res.redirect('/admin/sellprofile/' + post.author.id);
        } else {
            throw new Error('Post not found');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/adoption');
    }
    
});

module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');
const multer = require('multer');
const Post = require('../models/Post');
const path = require('path');
const Like = require('../models/LikePost');
const Comment = require('../models/Comment');

//Sey up multer
const storage = multer.diskStorage({
    // Set the destination directory for uploaded files
    destination: (req, file, cb) => {
      cb(null,'public/images/uploads/postimage'); // Files will be saved in the 'uploads/' directory
    },
    // Set the filename for uploaded files
    filename: (req, file, cb) => {
      // Prepend the current timestamp to the original filename to ensure uniqueness
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Create a Multer instance with the configured storage settings
  const upload = multer({ storage: storage,
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
             req.fileValidationError = "Please select a valid image file";
             return cb(null, false, req.fileValidationError);
       }
       cb(null, true);
    }
   }).single('myFile');


   //community route
   router.get('/',ensureAuthenticated, async (req, res) => {
    let page = req.query.page || 0;
    if(req.user.admin===true) {
        res.redirect('/admin/users');
        return;
    }
    else{
        let query = Post.find();
        let searchLink = '';
        if(req.query.search != null && req.query.search != ''){
            query = query.regex('title', new RegExp(req.query.search, 'i'));
            searchLink = '&search=' + req.query.search;
    
        }
        if(req.query.sortby == 'old'){
            query = query.sort({dateCreated: 1});
            searchLink = searchLink + '&sortby=old';
        }
        else{   
            query = query.sort({dateCreated: -1});
            searchLink = searchLink + '&sortby=new';
        }
        if(req.query.startDate != null && req.query.startDate != ''){
            query = query.where('dateCreated').gte(req.query.startDate);
            searchLink = searchLink + '&startDate=' + req.query.startDate;
        }
        function trueEndDate(date) {
            let dateArray = date.split('-');
            dateArray[2] = Number(dateArray[2]) + 1;
            return dateArray.join('-');
        }
        if(req.query.endDate != null && req.query.endDate != ''){
            query = query.where('dateCreated').lte(trueEndDate(req.query.endDate));
            searchLink = searchLink + '&endDate=' + req.query.endDate;
        }
        try{ 
            const allPosts = await query.populate('author').where('deleted').equals(false).skip(page *20).limit(20).exec();
            res.render('community' , {user: req.user, allPosts: allPosts, searchOptions: req.query, page: page, searchLink: searchLink});
        }catch(err){
            console.log(err);
        }
    }
})

//create post route
router.get('/createpost',ensureAuthenticated ,(req, res) => {
    res.render('createPost' , {user: req.user})
});

//create post action route
router.post('/createpost',ensureAuthenticated, upload ,async (req, res) => {
    
    try{
        let imagepath;
        if (req.fileValidationError) {
            throw new Error(req.fileValidationError);
       }
        if(req.file != null){
            if (req.fileValidationError) {
                throw new Error(req.fileValidationError);
           }
            imagepath = req.file.path;
            imagepath = imagepath.replace('public', '');
        }
        else{
           imagepath = null;
        }
        const post = new Post({
            title: req.body.title,
            description: req.body.description,
            author:req.user._id,
            image: imagepath
        })
        await post.save();
        res.redirect('/community');
    }catch(err){
        res.render('settingError', { user: req.user, error: err.message });
    }
});

router.get('/imgpost/:id/:origin',ensureAuthenticated, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id).populate('author').exec();
        const comments = await Comment.find({belongTo: req.params.id}).populate('author').exec();
        const like = await Like.find({post: req.params.id});
        const userLike = await Like.findOne({post: req.params.id, user: req.user.id});
        let verifyLike = false;
        let location;
        if(userLike != null){
            verifyLike = true;
        }
        if(req.params.origin == 'community'){
            location = '/community';
          }
         else{
            location = '/user/postprofile';
          }
        res.render('comment2', {user: req.user, post: post, comments: comments, likes: like, check: verifyLike, location: location});
    }catch(err){
        console.log(err);
    }
})
router.get('/post/:id/:origin',ensureAuthenticated, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id).populate('author').exec();
        const comments = await Comment.find({belongTo: req.params.id}).populate('author').exec();
        const like = await Like.find({post: req.params.id});
        const userLike = await Like.findOne({post: req.params.id, user: req.user.id});
        let location;
        let verifyLike = false;
        if(userLike != null){
            verifyLike = true;
        }
        if(req.params.origin == 'community'){
            location = '/community';
          }
        if(req.params.origin == 'userprofile'){
            location = '/user/postprofile';
          }
        res.render('comment', {user: req.user, post: post, comments: comments, likes: like, check: verifyLike, location: location});    
    }catch(err){
        console.log(err);
    }
})

router.put('/report/:id',ensureAuthenticated, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        post.reported = true;
        await post.save();
        res.redirect('/community');
    }catch(err){
        console.log(err);
    }
});


router.post('/comment/:id/:origin/:redirect',ensureAuthenticated, async (req, res) => {
    let location;
    try{
        const newComment = new Comment({
            comment: req.body.content,
            author: req.user.id,
            belongTo: req.params.id
        });
        if(req.params.origin == 'img'){
          location = 'imgpost';
        }
        if(req.params.origin == 'noimg'){
          location = 'post';
        }
        if(req.params.redirect == 'community'){
            redirect = '/community';
          }
        if(req.params.redirect == 'userprofile'){
            redirect = '/userprofile';
          }
        newComment.save();

        res.redirect('/community/'+location+'/'+req.params.id+redirect);

    }
    catch(err){
        console.log(err);
    }
})


router.post('/like/:id/:origin/:redirect',ensureAuthenticated, async (req, res) => {
    let location;
    try{
        if(req.body.like == 'like'){
            const newLike = new Like({
                post: req.params.id,
                user: req.user.id
            });
            newLike.save();
        }
        else{
            await Like.deleteOne({post: req.params.id, user: req.user.id});
        }
        if(req.params.origin == 'imgpost'){
            location = 'imgpost';
          }
        else{
            location = 'post';
          }
          if(req.params.redirect == 'community'){
            redirect = '/community';
          }
        if(req.params.redirect == 'userprofile'){
            redirect = '/userprofile';
          }
        res.redirect('/community/'+location+'/'+req.params.id+redirect);
    }catch(err){
        console.log(err);
    }
});

router.post('/deletecomment/:id/:postid/:origin/:redirect',ensureAuthenticated, async (req, res) => {
    let location;
    try{
        await Comment.deleteOne({ _id: req.params.id });
        if(req.params.origin == 'imgpost'){
            location = 'imgpost';
        }
        else{
            location = 'post';
        }
          if(req.params.redirect == 'community'){
            redirect = '/community';
        }
        if(req.params.redirect == 'userprofile'){
            redirect = '/userprofile';
          }
        res.redirect('/community/'+location+'/'+req.params.postid+redirect);
    }catch(err){
        console.log(err);
    }
});


module.exports = router;
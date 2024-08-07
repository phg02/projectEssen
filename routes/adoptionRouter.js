const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();




//stuff fot post
const multer = require('multer');
const AdoptionPost = require('../models/AdoptionPost');
const path = require('path');

const {ensureAuthenticated,forwardAuthenticated} =require('../config/auth');

const storage = multer.diskStorage({
    // Set the destination directory for uploaded files
    destination: (req, file, cb) => {
      cb(null,'public/images/uploads/adoptionImages'); // Files will be saved in the 'uploads/' directory
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



//adoption page
router.get('/',ensureAuthenticated, async (req, res) => {
    if(req.user.admin===true) {
        res.redirect('/admin/adoption');
        return;
    }
    else{
        
        let page = req.query.page || 0;
        let searchLink = '';
        let query = AdoptionPost.find({delete: false});

        if(req.query.search != null && req.query.search != ''){
            query = query.regex('title', new RegExp(req.query.search, 'i'));
            searchLink = '&search=' + req.query.search;    
        }
        if(req.query.petType == 'Dog'){
            query = query.where('petType').equals('Dog');
            searchLink = '&petType=Dog';
        }
        if(req.query.petType == 'Cat'){
            query =query.where('petType').equals('Cat');
            searchLink = '&petType=Cat';
        }
        try{ 
            const allPosts = await query.populate('author').skip(12 * page).limit(12).exec();
            res.render('adoption' , {user: req.user, allPosts: allPosts, search: req.query, petType: req.query, page: page, searchLink: searchLink});
            // allPosts.save()
        }catch(err){
            console.log(err);
        }
    }
});

//create listing
router.get('/createlisting',ensureAuthenticated ,(req, res) => {
    res.render('createPostPrice', {user: req.user})
});


//send Adoption post to db

router.post('/createlisting',ensureAuthenticated, upload ,async (req, res) => {
    
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
        const post = new AdoptionPost({
            title: req.body.title,
            petType: req.body.petType,
            description: req.body.description,
            price: req.body.price,
            author:req.user._id,
            image: imagepath,
            location: req.body.location
        })
        await post.save();
        res.redirect('/adoption');
    }catch(err){
        res.render('settingError', { user: req.user, error: err.message });
    }
});

//listing route
router.get('/listing/:id',ensureAuthenticated , async(req, res) => {
    try{
        const post = await AdoptionPost.findById(req.params.id).populate('author').exec();
        res.render('sellPet' , {user: req.user, post: post});
        // console.log(post);
    }
    catch{
        res.redirect('/adoption');
    }
    
});

//delete route
router.put('/listing/:id', ensureAuthenticated, async (req, res) => {
    try {
        let post = await AdoptionPost.findById(req.params.id);
        if (post) {
            // post.delete = true; 
            post.delete = true;
            await post.save();
            res.redirect('/user/sellerprofile');
        } else {
            throw new Error('Post not found');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/adoption');
    }
    
});



module.exports = router;
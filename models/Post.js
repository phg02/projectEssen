const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image:{
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    reported:{
        type: Boolean,
        default: false
    },
    deleted:{
        type: Boolean,
        default: false
    
    }
});

module.exports = mongoose.model('Post', postSchema);
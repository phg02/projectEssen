const moongose = require('mongoose');


const likePostSchema = new moongose.Schema({
    post:{
        type: moongose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user:{
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = moongose.model('LikePost', likePostSchema);
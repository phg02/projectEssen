const mongoose = require('mongoose');

const adoptionPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    petType: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    price: {
        type: Number,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    image: {
        type: String
    },

    delete: {
        type: Boolean,
        default: false
    }

    

    
});

module.exports = mongoose.model('AdoptionPost', adoptionPostSchema);
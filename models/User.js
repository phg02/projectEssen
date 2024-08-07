const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    theme: {
        type: String,
        default: 'light'
    },
    dateCreated:{
        type: Date,
        default: Date.now
    },
    activate:{
        type: Boolean,
        default: true
    },
    profilePic: {
        type: String,
        default: "/images/profile.png"
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
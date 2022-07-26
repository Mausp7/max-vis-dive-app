const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String},
    email: {type: String},

    providers: {
        google: {type: String, sparse: true, unique: true},
        facebook: {type: String, sparse: true, unique: true },
        github: {type: String, sparse: true, unique: true},

    },
    //password: {type: String, required: true}, // "" should not be enough, maybe validation
});

const User = mongoose.model('User', userSchema);

module.exports = User;
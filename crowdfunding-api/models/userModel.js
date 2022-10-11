const mongoose = require('mongoose');
const validator = require('validator');
//const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        unique: true,
        minLength: 5,
        maxLength: 100,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'A user must have an e-mail'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Email is not valid']
    },
    idDocument: {
        type: String,
        required: [true, 'A user must have an identification document'],
        minLength: 5,
        maxLength: 20
    },
    nationality: {
        type: String,
        required: [true, 'A user must have a target nationality']
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
        minLength: 8,
        select: false //This property setted as 'false' avoids that password be returned in queries
    },
    roles: {
        type: [String],
        enum: ['project-owner', 'donor', 'admin'],
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    lastLoginAttempt: {
        type: Date,
        default: Date.now()
    }, 
    loginAttempts: {
        type: Number,
        default: 0
    }
});

/* Checks if the number login attempts in last ten minutes is less than 5 */
userSchema.methods.checkLoginAttempts = function() {
    
    if (Date.now() > (this.lastLoginAttempt.getTime() + (10*60*1000))) {

        this.lastLoginAttempt = Date.now();
        this.loginAttempts = 0;
        this.save();
    }

    return this.loginAttempts;
}

/* Updates login attempts in case of wrong password */
userSchema.methods.updateLoginAttempts = function() {
    this.lastLoginAttempt = Date.now();
    this.loginAttempts = this.loginAttempts + 1;
    this.save();
}

const User = mongoose.model('User', userSchema);

module.exports = User;
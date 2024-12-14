const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 5, maxlength: 50 },
    email: { type: String, required: true, unique: true, minlength: 5, maxlength: 255 },
    password: { type: String, required: true, minlength: 8, maxlength: 1024 },
    profile_picture: { type: String, default: '' }, // URL or file path
    bio: { type: String, maxlength: 255, default: '' }, // Optional
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, name: this.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().email().min(5).max(255).required(),
        password: Joi.string().min(8).max(255).required(),
        profile_picture: Joi.string().uri().optional(),
        bio: Joi.string().max(255).optional(),
    });
    return schema.validate(user);
}

module.exports = { User, validateUser };

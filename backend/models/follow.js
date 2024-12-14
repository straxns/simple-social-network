const mongoose = require('mongoose');
const Joi = require('joi');


const followSchema = new mongoose.Schema({
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Follow = mongoose.model('Follow', followSchema);

function validateFollow(follow) {
    const schema = Joi.object({
        follower: Joi.objectId().required(),  // Validate follower as ObjectId
        following: Joi.objectId().required() // Validate following as ObjectId
    });

    return schema.validate(follow);
}

module.exports = {Follow, validateFollow};

const mongoose = require('mongoose');
const Joi = require('joi');

const likeSchema = new mongoose.Schema({
    target_id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'target_type' }, // Dynamic reference
    target_type: { type: String, required: true, enum: ['Post', 'Comment'] }, // Specifies Post or Comment
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now }
});

const Like = mongoose.model('Like', likeSchema);

function validateLike(like) {
    const schema = Joi.object({
        id: Joi.objectId().optional(),
        target_id: Joi.objectId().required(),
        target_type: Joi.string().valid('Post', 'Comment').required(),
        user_id: Joi.objectId().required(),
        created_at: Joi.date().optional()
    });

    return schema.validate(like);
}

module.exports = { Like, validateLike };



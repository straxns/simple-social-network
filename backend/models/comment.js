const mongoose = require('mongoose');
const Joi = require('joi');

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        content: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 5000
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment', // Reference to another Comment model, if this is a reply
            default: null
        }
    },
    { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

function validateComment(comment) {
  const schema = Joi.object({
      user: Joi.objectId().required(),  // Validate user (ObjectId reference to User model)
      post: Joi.objectId().required(),  // Validate post (ObjectId reference to Post model)
      content: Joi.string().min(1).max(5000).required(), // Comment content (1 to 5000 characters)
      parentComment: Joi.objectId().optional(), // Validate optional parentComment (for nested comments)
  });

  return schema.validate(comment);
}

module.exports = {Comment, validateComment};

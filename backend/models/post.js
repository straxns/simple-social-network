const mongoose = require('mongoose');
const Joi = require('joi');

const postSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  }, { timestamps: true });
  
  // Automatically update `updated_at`
  // postSchema.pre('save', function (next) {
  //   this.updated_at = Date.now();
  //   next();
  // });

  const Post = mongoose.model('Post', postSchema);

  
function validatePost(post) {
    const schema = Joi.object({
        id: Joi.objectId().optional(),  // Optionally validate post ID
        user_id: Joi.objectId().required(),  // Validate user_id as ObjectId
        content: Joi.string().min(1).max(5000).required(),
        created_at: Joi.date().optional(),
        updated_at: Joi.date().optional()
    });

    return schema.validate(post);
}

module.exports = {Post ,validatePost};



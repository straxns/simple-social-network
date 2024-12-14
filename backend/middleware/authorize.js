const {Post} = require('../models/post');

const authorize = async (req, res, next) => {
    try {
        console.log(req.params.id);
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found.');

        // Check if the authenticated user is the owner of the post
        if (post.user_id.toString() !== req.user._id) {
            return res.status(403).send('Access denied.');
        }

        next();
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = authorize;

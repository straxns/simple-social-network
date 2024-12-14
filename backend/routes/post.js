const express = require('express');
const {Post, validatePost} = require('../models/post');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();
const _ = require('lodash');


router.post('/', auth, async (req, res) => {
    // Validate the incoming post data
    console.log(req.body);
    const { error } = validatePost({
        user_id: req.user._id,
        content: req.body.content,
    });
    if (error) return res.status(400).send(error.details[0].message);

    try {
        // Create a new post
        const post = new Post({
            user_id: req.user._id,  // Get the user ID from the authenticated user
            content: req.body.content,
        });

        // Save the post to the database
        await post.save();

        // Respond with the created post
        res.status(201).send(post);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find() // Fetch posts
            .populate('user_id', 'name profile_picture') // Populate `user_id` field from the `User` model
            .sort({ created_at: -1 }); // Sort by created_at in descending order

        res.send(posts); // Send posts as the response
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// Get all posts by user_id
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Find all posts by the given userId
        const posts = await Post.find({ user_id: userId })
            .populate('user_id', 'name profile_picture') // Optionally populate user info
            .sort({ created_at: -1 }); // Sort posts by created_at (latest first)

        if (!posts || posts.length === 0) {
            return res.status(404).send('No posts found for this user.');
        }

        res.send(posts);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});




// Get a single post by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await Post.findById(id).populate('user_id', 'name profile_picture'); // Updated 'user' to 'user_id'
        if (!post) return res.status(404).send('Post not found.');
        res.send(post);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});



// Update a post
router.put('/:id', auth, authorize, async (req, res) => {
    const { error } = validatePost({
        user_id: req.user._id,
        content: req.body.content,
    });
    if (error) return res.status(400).send(error.details[0].message);

    const updates = _.pick(req.body, ['content']);

    try {
        const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });

        res.send(post);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// Delete a post
router.delete('/:id', [auth, authorize], async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        res.send(post);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
const express = require('express');
const {Comment, validateComment} = require('../models/comment');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();
const _ = require('lodash');

router.post('/', auth, async (req, res) => {
    const { error } = validateComment(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { user, post, content, parentComment } = req.body;

    try {
        const comment = new Comment({
            user,       // user ID (ObjectId)
            post,       // post ID (ObjectId)
            content,    // comment content
            parentComment // optional parent comment ID (for replies)
        });

        await comment.save();
        res.status(201).send(comment);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// **2. Get All Comments for a Post**
router.get('/post/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await Comment.find({ post: postId, parentComment: null })
            .populate('user', 'name profile_picture')
            .sort({ createdAt: -1 }); // Optional: Sort by newest first

        res.send(comments);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});



// **3. Get a Specific Comment**
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await Comment.findById(id)
            .populate('user', 'name profile_picture')
            .populate('parentComment', 'content user createdAt');

        if (!comment) return res.status(404).send('Comment not found.');
        res.send(comment);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// **4. Update a Comment**
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') return res.status(400).send('Content cannot be empty.');

    try {
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).send('Comment not found.');

        // Check if the logged-in user is the owner of the comment
        if (comment.user.toString() !== req.user._id) return res.status(403).send('Access denied.');

        comment.content = content;
        await comment.save();

        res.send(comment);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// **5. Delete a Comment**
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).send('Comment not found.');

        // Check if the logged-in user is the owner of the comment or an admin
        if (comment.user.toString() !== req.user._id && !req.user.isAdmin)
            return res.status(403).send('Access denied.');

        // Delete the comment and any nested replies
        await Comment.deleteMany({
            $or: [{ _id: id }, { parentComment: id }]
        });

        res.send({ message: 'Comment deleted successfully.' });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// **6. Get Replies for a Comment**
router.get('/:id/replies', async (req, res) => {
    const { id } = req.params;

    try {
        const replies = await Comment.find({ parentComment: id })
            .populate('user', 'name profile_picture')
            .sort({ createdAt: -1 }); // Optional: Sort by newest first

        if (!replies.length) return res.status(404).send('No replies found for this comment.');

        res.send(replies);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;

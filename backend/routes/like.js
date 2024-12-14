const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Like, validateLike } = require('../models/like');

router.post('/', auth, async (req, res) => {
    req.body.user_id = req.user._id;
    const { error } = validateLike(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    
    const { target_id, target_type, user_id } = req.body;
    if (!['Post', 'Comment'].includes(target_type)) {
        return res.status(400).send('Invalid target type.');
    }
    
    try {
        // Check if the user already liked the target
        const existingLike = await Like.findOne({ target_id, target_type, user_id });
        if (existingLike) return res.status(400).send('You have already liked this item.');

        // Create a new like
        const like = new Like({ target_id, target_type, user_id });
        await like.save();

        res.status(201).send(like);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/', auth, async (req, res) => {
    req.body.user_id = req.user._id;
    const { error } = validateLike(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { target_id, target_type, user_id } = req.body;

    try {
        // Check if the like exists
        const like = await Like.findOneAndDelete({ target_id, target_type, user_id });
        if (!like) return res.status(404).send('Like not found.');

        res.send('Like removed successfully.');
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:target_id', async (req, res) => {
    const { target_id } = req.params;
    const { target_type } = req.query; // Expecting query parameter target_type=Post/Comment

    try {
        if (!['Post', 'Comment'].includes(target_type)) {
            return res.status(400).send('Invalid target type.');
        }

        const likes = await Like.find({ target_id, target_type }).populate('user_id', 'name profile_picture');

        res.send(likes);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:target_id/count', async (req, res) => {
    const { target_id } = req.params;
    const { target_type } = req.query; // Expecting query parameter target_type=Post/Comment

    try {
        if (!['Post', 'Comment'].includes(target_type)) {
            return res.status(400).send('Invalid target type.');
        }

        const likeCount = await Like.countDocuments({ target_id, target_type });

        res.send({ target_id, target_type, likeCount });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
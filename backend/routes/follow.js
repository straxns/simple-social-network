const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {Follow, validateFollow} = require('../models/follow');
const mongoose = require('mongoose');

// **1. Follow a user**
router.post('/', auth, async (req, res) => {
    req.body.follower = req.user._id; // Automatically set the current user as the follower
    const { error } = validateFollow(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { follower, following } = req.body;

    if (follower.toString() === following.toString()) {
        return res.status(400).send('You cannot follow yourself.');
    }

    try {
        // Check if the follow relationship already exists
        const existingFollow = await Follow.findOne({ follower, following });
        if (existingFollow) return res.status(400).send('You are already following this user.');

        // Create a new follow relationship
        const follow = new Follow({ follower, following });
        await follow.save();

        res.status(201).send(follow);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// **2. Unfollow a user**
router.delete('/:following', auth, async (req, res) => {
    try {
        const follower = req.user._id; // Authenticated user's ID
        const { following } = req.params; // Get the target user ID from the URL
        // Validate the following ID
        if (!mongoose.Types.ObjectId.isValid(following)) {
            return res.status(400).send('Invalid user ID.');
        }

        // Check if the follow relationship exists
        const follow = await Follow.findOneAndDelete({ follower, following });
        if (!follow) {
            return res.status(404).send('Follow relationship not found.');
        }

        res.status(200).send({ message: 'Unfollowed successfully.', follow });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});


// **3. Get followers of a user**
router.get('/:id/followers', async (req, res) => {
    const { id } = req.params; // User ID to get followers for

    try {
        const followers = await Follow.find({ following: id })
            .populate('follower', 'name profile_picture') // Populate follower details
            .select('follower'); // Only return follower information

        if (!followers.length) return res.status(404).send('No followers found.');

        res.send(followers);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// **4. Get following of a user**
router.get('/:id/following', async (req, res) => {
    const { id } = req.params; // User ID to get following for

    try {
        const following = await Follow.find({ follower: id })
            .populate('following', 'name profile_picture') // Populate following details
            .select('following'); // Only return following information

        if (!following.length) return res.status(404).send('No following found.');

        res.send(following);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// **5. Check if a user is following another user**
router.get('/is-following/:follower/:following', async (req, res) => {
    const { follower, following } = req.params;

    try {
        const isFollowing = await Follow.exists({ follower, following });
        res.send({ isFollowing: !!isFollowing });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

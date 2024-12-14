const express = require('express');
const {User} = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();
const _ = require('lodash');
const Joi = require('joi');

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).send('User not found.');

        // Optionally, pick specific fields to send in the response
        res.send(_.pick(user, ['_id', 'name', 'email', 'profile_picture', 'bio']));
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});


router.put('/me', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Pick only the allowed fields from the request body
    const updates = _.pick(req.body, ['name', 'profile_picture', 'bio']);

    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true } // Return the updated document
        ).select('-password');

        if (!user) return res.status(404).send('User not found.');

        res.send(user);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

function validate(user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).optional(),
        profile_picture: Joi.string().uri().optional(),
        bio: Joi.string().max(255).optional(),
    });
    return schema.validate(user);
}


module.exports = router;

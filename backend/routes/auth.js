const express = require('express');
const bcrypt = require('bcrypt');
const { User, validateUser } = require('../models/user');

const router = express.Router();

// Register Endpoint
const _ = require('lodash');

router.post('/register', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Pick only the allowed fields from the request body
    const { name, email, password } = _.pick(req.body, ['name', 'email', 'password']);

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).send('User already registered.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user instance with sanitized data
        user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = user.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});


// Login Endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Invalid email or password.');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        const token = user.generateAuthToken();
        res.send({ token });
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;

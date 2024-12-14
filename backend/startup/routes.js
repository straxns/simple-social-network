const bodyParser = require('body-parser');
const express = require('express');
const users = require('../routes/user');
const auth = require('../routes/auth');
const post = require('../routes/post');
const comment = require('../routes/comment');
const like = require('../routes/like');
const follow = require('../routes/follow');
const error = require('../middleware/error');

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(express.json());
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use('/api/posts', post);
    app.use('/api/comments', comment);
    app.use('/api/likes', like);
    app.use('/api/follows', follow);
    app.use(error);
}
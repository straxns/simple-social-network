require('dotenv').config();
const express = require('express');
const app = express();

// require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
// require('./startup/prod')(app);

  
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Connected at port ${port}`);
  });

  module.exports = server;
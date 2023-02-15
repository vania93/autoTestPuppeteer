const express = require('express');
const controllers= require('./controllers');
const router = express.Router();

router.get('/mail/read/:messageId', controllers.readMail);

module.exports = router;
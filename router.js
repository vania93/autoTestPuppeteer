const express = require('express');
const controllers= require('./controllers');
const router = express.Router();

router.get('/mail/read/:messageId', controllers.readMail);
router.get('/mail/messages/:email', controllers.getList);

module.exports = router;
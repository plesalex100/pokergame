
// Make a router instance
const express = require('express');
const router = express.Router();

router.use('/api/auth', require('./auth'));
router.use('/table', require('./table'));

module.exports = router;
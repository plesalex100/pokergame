
const express = require('express');

// current path: /
const router = express.Router();

router.use('/api/auth', require('./auth'));
router.use('/api/table', require('./table'));

router.use('/', require('./frontend'));

module.exports = router;
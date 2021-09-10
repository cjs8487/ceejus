const express = require('express');

const quotes = require('./QuotesAPI');

const router = express.Router();

router.use('/quotes', quotes);

module.exports = router;

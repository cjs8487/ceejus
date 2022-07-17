import { Router } from 'express';
import bodyParser from 'body-parser';

import quotes from './QuotesAPI';
import twitchAuth from './auth/TwitchAuth';

const router = Router();

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});
router.use(bodyParser.json());

router.use('/quotes', quotes);
router.use('/auth/twitch', twitchAuth);

module.exports = router;

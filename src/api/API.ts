import { Router } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import MemoryStore from 'memorystore';

import { isAuthenticated } from './APICore';
import quotes from './QuotesAPI';
import twitchAuth from './auth/TwitchAuth';
import rewards from './twitch/Rewards';
import { sessionSecret } from '../Environment';

export type SessionUser = {
    userId: number;
    username: string;
};

declare module 'express-session' {
    interface SessionData {
        user: SessionUser;
    }
}

const router = Router();

router.use(bodyParser.json());
router.use(
    session({
        store: new (MemoryStore(session))({
            checkPeriod: 864000000,
        }),
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
    }),
);

router.use('/quotes', quotes);
router.use('/auth/twitch', twitchAuth);
router.use('/rewards', rewards);
router.get('/me', isAuthenticated, (req, res) => {
    res.send(req.session.user);
});

export default router;

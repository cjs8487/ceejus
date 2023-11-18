import { Router } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { isAuthenticated, logout } from './APICore';
import quotes from './QuotesAPI';
import twitchAuth from './auth/TwitchAuth';
import { sessionSecret, testing } from '../Environment';
import { getUser } from '../database/Users';
import { apiClient, isUserRegistered } from '../auth/TwitchAuth';
import discordAuth from './auth/DiscordAuth';
import { sessionStore } from '../System';
import economy from './economy/Economy';
import twitch from './twitch/Twitch';
import config from './Config';

export type SessionUser = {
    userId: number;
    username: string;
};

declare module 'express-session' {
    interface SessionData {
        user: SessionUser;
        state?: string;
    }
}

const router = Router();

router.use(bodyParser.json());
router.use(
    session({
        store: sessionStore,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: !testing },
        proxy: !testing,
        unset: 'destroy',
    }),
);

router.use('/quotes', quotes);
router.use('/auth/twitch', twitchAuth);
router.use('/auth/discord', discordAuth);
router.use('/economy', economy);
router.use('/twitch', twitch);
router.use('/config', config);

router.get('/me', isAuthenticated, async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = getUser(req.session.user.userId);
    if (!user) {
        res.sendStatus(403);
        return;
    }
    if (!isUserRegistered(user.twitchId)) {
        req.session.destroy(() => res.sendStatus(401));
        return;
    }
    const twitchUserData = await apiClient.users.getUserByName(user.username);
    if (!twitchUserData) {
        res.sendStatus(500);
        return;
    }
    res.send({
        userId: user.userId,
        username: user.username,
        avatar: twitchUserData?.profilePictureUrl,
    });
});

router.get('/logout', isAuthenticated, logout);

export default router;

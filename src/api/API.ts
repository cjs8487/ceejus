import { Router } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { APIConnection } from 'discord.js';
import { isAuthenticated, logout } from './APICore';
import quotes from './QuotesAPI';
import twitchAuth from './auth/TwitchAuth';
import rewards from './twitch/Rewards';
import { sessionSecret } from '../Environment';
import { getUser } from '../database/Users';
import { apiClient } from '../auth/TwitchAuth';
import discordAuth from './auth/DiscordAuth';
import { DiscordToken } from '../auth/DiscordTokens';

export type SessionUser = {
    userId: number;
    username: string;
};

type DiscordAuthData = {
    token: DiscordToken;
    connections: APIConnection[];
    selectedConnection: string;
};

declare module 'express-session' {
    interface SessionData {
        user: SessionUser;
        state?: string;
        discordAuthData?: DiscordAuthData;
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
router.use('/auth/discord', discordAuth);
router.use('/rewards', rewards);
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

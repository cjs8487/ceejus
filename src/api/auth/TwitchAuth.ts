import { Router } from 'express';
import { createHash } from 'crypto';
import { logError, logWarn } from '../../Logger';
import {
    apiClient,
    doCodeExchange,
    registerUserAuth,
} from '../../auth/TwitchAuth';
import { twitchClientId, twitchRedirect } from '../../Environment';
import {
    addAuthToUser,
    getRefreshTokenForService,
    getUserByName,
    registerUser,
    updateAuth,
    userExists,
} from '../../database/Users';
import { joinChat } from '../../twitch/TwitchBot';

const twitchAuth = Router();

const authRoot = 'https://id.twitch.tv/oauth2/authorize';
const redirectUrl = encodeURIComponent(twitchRedirect);
const scopeList = [
    'channel:manage:polls',
    'channel:read:polls',
    'channel:manage:redemptions',
    'moderator:read:chatters',
];
const scopes = `scope=${encodeURIComponent(scopeList.join(' '))}`;
const authUrl = `${authRoot}?client_id=${twitchClientId}&redirect_uri=${redirectUrl}&${scopes}&response_type=code`;

twitchAuth.get('/doauth', (req, res) => {
    const sessionHash = createHash('sha256');
    sessionHash.update(req.session.id);
    const state = sessionHash.digest('base64url');
    req.session.state = state;
    res.redirect(`${authUrl}&state=${state}`);
});

twitchAuth.get('/redirect', async (req, res, next) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (state !== req.session.state) {
        // deny the auth request, this is a possible instance of CSRF, replay attack, or other malicious request
        logWarn(
            `A potentially malicious Twitch authorization request has been denied. Session id: ${req.session.id}`,
        );
        // destroy this session immediately - if this is a malicious request this will prevent any further requests
        // from attempting to hijack this session
        req.session.destroy((err) => {
            if (err) next();
            // ultimately we need to redirect out of the backend flow even if though it failed
            res.redirect('/');
        });
        return;
    }
    try {
        const firstToken = await doCodeExchange(code);
        if (!firstToken) {
            res.status(500).send(
                'An unknown error ocurred while processing the request. You have not been authorized',
            );
            return;
        }
        registerUserAuth(firstToken);
        const user = await apiClient.users.getAuthenticatedUser(
            firstToken.userId,
        );

        let userId: number;
        if (!userExists(user.displayName)) {
            userId = registerUser(user.displayName, user.id);
            joinChat(user.name);
        } else {
            userId = getUserByName(user.displayName)!.userId;
        }
        if (!getRefreshTokenForService(userId, 'twitch')) {
            addAuthToUser(userId, 'twitch', firstToken.refreshToken ?? '');
        } else {
            updateAuth(userId, 'twitch', firstToken.refreshToken ?? '');
        }
        req.session.regenerate((genErr) => {
            if (genErr) {
                next(genErr);
                return;
            }
            req.session.user = { userId, username: user.displayName };
            req.session.save((saveErr) => {
                if (saveErr) {
                    next(saveErr);
                    return;
                }
                res.redirect('/');
            });
        });
    } catch (e: any) {
        logError(e);
        res.status(500).send(e.message);
    }
});

export default twitchAuth;

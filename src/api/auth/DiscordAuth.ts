import { createHash } from 'crypto';
import { Router } from 'express';
import axios, { isAxiosError } from 'axios';
import { APIConnection, APIUser, ConnectionService } from 'discord.js';
import { discordClientId, discordRedirect } from '../../Environment';
import { logError, logWarn } from '../../Logger';
import { exchangeCode } from '../../auth/DiscordTokens';
import {
    addAuthToUser,
    getUserByDiscordId,
    getUserByTwitchId,
    registerUser,
    updateUserDiscordId,
} from '../../database/Users';
import { apiClient } from '../../auth/TwitchAuth';

const discordAuth = Router();

const authRoot = 'https://discord.com/api/oauth2/authorize';
const redirectUrl = encodeURIComponent(discordRedirect);
const scopeList = ['identify', 'connections'];
const scopes = `scope=${encodeURIComponent(scopeList.join(' '))}`;
const authUrl = `${authRoot}?client_id=${discordClientId}&redirect_uri=${redirectUrl}&response_type=code&${scopes}`;

discordAuth.get('/authorize', (req, res) => {
    const sessionHash = createHash('sha256');
    sessionHash.update(req.session.id);
    const state = sessionHash.digest('base64url');
    req.session.state = state;
    res.redirect(`${authUrl}&state=${state}`);
});

// redirect flow
// 1. check state
//      - Fail, reject immediately, redirect to error page
// 2. Exchange the received code for an access token
// 3. Check session for a user
//  - If user found
//      1. Write auth data to database, flagging as needing setup
//      2. Redirect to setup page
//  - If no user
//      1. Retrieve shell data from Twitch
//      2. Create user record
//      3.

discordAuth.get('/redirect', async (req, res, next) => {
    res.status(200);
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (state !== req.session.state) {
        // deny the auth request, this is a possible instance of CSRF, replay attack, or other malicious request
        logWarn(
            `A potentially malicious Discord authorization request has been denied. Session id: ${req.session.id}`,
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
        const token = await exchangeCode(code);

        const { data }: { data: APIUser } = await axios.get(
            'https://discord.com/api/v10/users/@me',
            {
                headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                },
            },
        );

        // determine if we even need to continue with this request
        const userByDiscord = getUserByDiscordId(data.id);
        if (userByDiscord) {
            console.log('ERROR DISCORD ID ALREADY REGISTERED');
            res.status(400).send(
                'A user with this Discord id already exists. Cannot re-register it.',
            );
            return;
        }

        const { data: connections }: { data: APIConnection[] } =
            await axios.get(
                'https://discord.com/api/v10/users/@me/connections',
                {
                    headers: {
                        Authorization: `Bearer ${token.accessToken}`,
                    },
                },
            );
        const twitchConnections = connections.filter(
            (connection) => connection.type === ConnectionService.Twitch,
        );

        if (req.session.user) {
            const user = req.session.user;
            if (twitchConnections.length === 0) {
                console.log('ERROR NO CONNECTIONS');
                res.status(400).send(
                    'No Twitch connections on supplied account.',
                );
                return;
            }
            const matchingConnections = twitchConnections.filter(
                (connection) => connection.name === user.username,
            );
            if (matchingConnections.length === 0) {
                console.log('ERROR NO MATCHING CONNECTION');
                res.status(400).send(
                    'No Twitch connection on the supplied account matches the current user.',
                );
                return;
            }
            updateUserDiscordId(user.userId, data.id);
            addAuthToUser(user.userId, 'discord', token.refreshToken);
            res.status(200).send(
                `Successfully connected Discord-${data.global_name} to Twitch-${matchingConnections[0].name}`,
            );
        } else {
            if (twitchConnections.length === 0) {
                console.log('ERROR NO CONNECTIONS');
                res.status(400).send(
                    'No Twitch connections on supplied account.',
                );
                return;
            }

            if (twitchConnections.length > 1) {
                console.log('ERROR MULTIPLE CONNECTIONS');
                res.status(400).send(
                    'Discord account has multiple Twitch connections. Unable to create connection',
                );
                return;
            }
            const connection = twitchConnections[0];
            if (userByDiscord) {
                console.log('ERROR DISCORD ID ALREADY REGISTERED');
                res.status(400).send(
                    'A user with this Discord id already exists. Cannot create a new user for it',
                );
                return;
            }

            const userByTwitch = getUserByTwitchId(connection.id);
            if (userByTwitch) {
                updateUserDiscordId(userByTwitch.userId, data.id);
                addAuthToUser(
                    userByTwitch.userId,
                    'discord',
                    token.refreshToken,
                );
                res.status(200).send(
                    `Successfully connected Discord-${data.global_name} to Twitch-${connection.name}`,
                );
                return;
            }

            const twitchUser = await apiClient.users.getUserById(connection.id);
            if (!twitchUser) {
                console.log('ERROR NO TWITCH USER DATA FOUND');
                res.status(400).send(
                    'Unable to find Twitch user for connection',
                );
                return;
            }
            registerUser(twitchUser.displayName, twitchUser.id, data.id);
            res.status(200).send(
                `Successfully created account for Twitch-${connection.name} and connected Discord-${data.global_name}`,
            );
        }

        // get user if it exists, otherwise register them internally

        // const user = await getOrCreateUser(data, true, token);
        // check the refresh flag - this should never be set on newly created users, so this check, while wasting a few
        // cycles if the user is newly created, is completely safe regardless of which code path obtained the user
        // if the flag is set, update the stored oauth data and clear the flag
        // if (!user) {
        //     logError(
        //         `Find or create user resulted in an undefined user. Search for id ${
        //             data.id
        //         }} failed while using the ${typeof data.id} overload`,
        //     );
        //     res.status(500).send(
        //         'An unknown error ocurred during authorization',
        //     );
        //     return;
        // }

        // load data into session and send
        req.session.regenerate((err) => {
            if (err) next(err);

            // req.session.loggedIn = true;
            // req.session.user = user.id;

            req.session.save((saveErr) => {
                if (saveErr) next(saveErr);
                // res.redirect('/');
            });
        });
    } catch (e) {
        if (isAxiosError(e)) {
            logError(
                `${e.message}: ${e.response?.status} - ${JSON.stringify(
                    e.response?.data,
                )}`,
            );
        } else {
            logError(
                `An unknown error ocurred while handling a request - ${e}`,
            );
        }
        res.status(500).send();
    }
});

export default discordAuth;

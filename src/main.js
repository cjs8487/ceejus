import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { DirectConnectionAdapter, EventSubListener, EventSubMiddleware, ReverseProxyAdapter } from '@twurple/eventsub';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import UserManager from './database/UserManager';
import { EconomyRedemptionsManager } from './database/EconomyRedemptionsManager';
import AuthManager from './auth/TokenManager';
import EconomyCore from './modules/economy/EconomyCore.ts';
import { handleRedemption } from './api/twitch/Rewards';
import { RedemptionsManager } from './database/RedemptionsManager';
import TwitchEventSubHandler from './lib/TwitchEventSub';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        // expose the raw body of the request for signature verification
        req.rawBody = buf;
    },
}));

const https = require('https');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const fs = require('fs');
const { QuotesCore } = require('./modules/quotes/QuotesCore');
const { DiscordBot } = require('./discord/DiscordBot');
const { PublicQuotesBot } = require('./twitch/PublicQuotesBot');
const TwitchBot = require('./twitch/TwitchBot');
const { TwitchAPI } = require('./api/twitch/TwitchAPI');
const { TwitchOAuth } = require('./api/twitch/TwitchOAuth');
const api = require('./api/API');

const port = 8081;

let apiEnabled;
if (process.env.API_ENABLED === 'true') {
    apiEnabled = true;
} else {
    apiEnabled = false;
}

const clientId = process.env.TWITCH_CLIENT_ID;
const authToken = process.env.AUTH_TOKEN;
const ngrokUrl = process.env.NGROK_URL;
const secret = process.env.SECRET;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const channelAuth = process.env.CHANNEL_AUTH;

if (apiEnabled) {
    console.log('full api is enabled');

    const twitchApi = new TwitchAPI(clientId, authToken);
    const twithOAuth = new TwitchOAuth(clientId, clientSecret);

    twithOAuth.getAuthorizationCode('ksrho1aok0ncdzog26xmbgq9lqejik');

    app.post('/getAppAccessToken', async (req, res) => {
        const token = await twithOAuth.getAppAccessToken();
        res.write(token.access_token);
        res.end();
    });

    app.post('/listsubs', (req, res) => {
        const getSubsParams = {
            host: 'api.twitch.tv',
            path: 'helix/eventsub/subscriptions',
            method: 'GET',
            headers: {
                'Client-ID': clientId,
                Authorization: `Bearer ${authToken}`,
            },
        };
        let responseData = '';
        const request = https.request(getSubsParams, (result) => {
            result.setEncoding('utf8');
            result.on('data', (d) => {
                responseData += d;
            }).on('end', () => {
                const responseBody = JSON.parse(responseData);
                res.send(responseBody);
            });
        });
        request.on('error', (e) => { console.log(`Error ${e}`); });
        request.end();
    });

    app.post('/deletesub/:subId', (req, res) => {
        const deleteSubsParams = {
            host: 'api.twitch.tv',
            path: `helix/eventsub/subscriptions?id=${req.params.subId}`,
            method: 'DELETE',
            headers: {
                'Client-ID': clientId,
                Authorization: `Bearer ${authToken}`,
            },
        };
        const request = https.request(deleteSubsParams);
        request.on('error', (e) => { console.log(`Error ${e}`); });
        request.end();
        res.status(200).send();
    });

    app.get('/userData/:username', async (req, res) => {
        const response = await twitchApi.getUsersByLogin(req.params.username);
        console.log(`[express response] ${response}`);
        res.send(response);
    });

    app.post('/validateAppAuth', async (req, res) => {
        const isValid = await twithOAuth.isTokenValid(authToken);
        res.send(isValid ? 'Valid' : 'Not valid');
    });
}

let db;
if (process.env.testing === 'true') {
    db = new Database('database.db', { verbose: console.log });
} else {
    db = new Database('database.db');
}

// set up the databse
// the setup script will run everytime the bot starts.
// Take care that it will not overwrite data and will always work or the bot may not start
const setupScript = fs.readFileSync('src/dbsetup.sql', 'utf-8');
db.exec(setupScript);

const userManager = new UserManager(db);
const economyRedemptionsManager = new EconomyRedemptionsManager(db);
const redemptionsManager = new RedemptionsManager(db);
const tokenManager = new AuthManager(clientId, clientSecret, userManager);
const botAuthProvider = new StaticAuthProvider(clientId, authToken, undefined, 'app');
const apiClient = new ApiClient({ authProvider: botAuthProvider });

// const eventSubListener = new EventSubListener({
//     apiClient,
//     adapter: new ReverseProxyAdapter({
//         hostName: ngrokUrl,
//     }),
//     secret,
// });

const eventSubManager = new TwitchEventSubHandler(clientId, apiClient, clientSecret, botAuthProvider, app, ngrokUrl);

app.set('userManager', userManager);
app.set('tokenManager', tokenManager);
app.set('redemptionsManager', redemptionsManager);
app.set('economyRedemptionsManager', economyRedemptionsManager);
app.set('apiClient', apiClient);
app.set('clientId', clientId);
app.set('eventSubManager', eventSubManager);

// const quotesCore = new QuotesCore();
// quotesCore.initialize(db);
// app.set('quotesCore', quotesCore);

// const economyCore = new EconomyCore(db);
// app.set('economyCore', economyCore);
//
// const twitchBot = new TwitchBot.TwitchBot(db, economyCore);
// const publicQuotesBot = new PublicQuotesBot(db);
// twitchBot.setupDb(db);
// const discordBot = new DiscordBot(db);

// const subscribtionCalls = new Map();
// subscribtionCalls.set(
//     'channel.channel_points_custom_reward_redemption.add',
//     eventSubListener.subscribeToChannelRedemptionAddEvents,
// );
// const rewardDelegates = new Map();
// rewardDelegates.set('economy', handleRedemption);

if (apiEnabled) {
    app.use('/api', api);

    app.listen(port, async () => {
        console.log(`Twitch Eventsub Webhook listening on port ${port}`);
        // await apiClient.eventSub.deleteAllSubscriptions();
        // await eventSubListener.listen();
        // const followSub = await eventSubListener.subscribeToChannelFollowEvents(12826, (event) => {
        //     console.log(`${event.userDisplayName} just followed ${event.broadcasterDisplayName}!`);
        // });
        (await apiClient.eventSub.getSubscriptions()).data.forEach((sub) => {
            console.log(`${sub.id}: ${sub.type} when ${JSON.stringify(sub.condition)}`);
            // const metadata = redemptionsManager.getMetadata(sub.id);
            // const user = userManager.getUser(metadata.owner);
            const userApiClient = tokenManager.getApiClient(userManager.getUser('cjs0789').id);
            switch (sub.type) {
                case 'channel.channel_points_custom_reward_redemption.add':
                    // eventSubListener.subscribeToChannelRedemptionAddEventsForReward(
                    //     sub.condition.broadcaster_user_id,
                    //     sub.condition.reward_id,
                    //     (event) => handleRedemption(event, userApiClient),
                    // );
                    // switch (metadata.module) {
                    //     case 'economy':
                    //         eventSubListener.subscribeToChannelRedemptionAddEventsForReward(
                    //             user.twitchId,
                    //             metadata.twitchRewardId,
                    //             (event) => handleRedemption(event, userApiClient),
                    //         );
                    //         break;
                    //     default:
                    //         console.log(`${metadata.module} has no handler for ${sub.type}`);
                    //         break;
                    // }
                    break;
                default:
                    console.log(`Existing eventsub subscription found for unregistered type ${sub.type}`);
            }
        });
    });
}

// Ensure that the database connection is closed when the process terminates
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export {};

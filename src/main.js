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
const querystring = require('querystring');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const fs = require('fs');
const { DiscordBot } = require('./discord/DiscordBot');
const { PublicQuotesBot } = require('./twitch/PublicQuotesBot');
const TwitchBot = require('./twitch/TwitchBot');
const { TwitchAPI } = require('./api/twitch/TwitchAPI');
const { TwitchOAuth } = require('./api/twitch/TwitchOAuth');

const port = 3000;

const clientId = process.env.TWITCH_CLIENT_ID;
const authToken = process.env.AUTH_TOKEN;
const ngrokUrl = process.env.NGROK_URL;
const secret = process.env.SECRET;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

const twitchApi = new TwitchAPI(clientId, authToken);
const twithOAuth = new TwitchOAuth(clientId, clientSecret);

app.post('/getAppAccessToken', (req, res) => {
    
});

app.post('/createWebhook/:broadcasterId', (req, res) => {
    const createWebhookParams = {
        host: 'api.twitch.tv',
        path: 'helix/eventsub/subscriptions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Client-ID': clientId,
            Authorization: `Bearer ${authToken}`,
        },
    };
    const createWebHookBody = {
        type: 'channel.follow',
        version: '1',
        condition: {
            broadcaster_user_id: req.params.broadcasterId,
        },
        transport: {
            method: 'webhook',
            callback: `${ngrokUrl}/notification`,
            secret,
        },
    };
    let responseData = '';
    const webhookReq = https.request(createWebhookParams, (result) => {
        result.setEncoding('utf8');
        result.on('data', (d) => {
            responseData += d;
        }).on('end', () => {
            const responseBody = JSON.parse(responseData);
            res.send(responseBody);
        });
    });
    webhookReq.on('error', (e) => { console.log(`Error ${e}`); });
    webhookReq.write(JSON.stringify(createWebHookBody));
    webhookReq.end();
});

function verifySignature(messageSignature, messageID, messageTimestamp, body) {
    const message = messageID + messageTimestamp + body;
    const signature = crypto.createHmac('sha256', secret).update(message);
    const expectedSignature = `sha256=${signature.digest('hex')}`;

    return expectedSignature === messageSignature;
}

app.post('/notification', (req, res) => {
    console.log('POST to /notification');
    if (!verifySignature(req.header('Twitch-Eventsub-Message-Signature'),
        req.header('Twitch-Eventsub-Message-Id'),
        req.header('Twitch-Eventsub-Message-Timestamp'),
        req.rawBody)) {
        console.log('failed message signature verification');
        res.status(403).send('Forbidden');
    } else {
        const messageType = req.header('Twitch-Eventsub-Message-Type');
        if (messageType === 'webhook_callback_verification') {
            console.log(req.body.challenge);
            res.send(req.body.challenge);
        } else if (messageType === 'notification') {
            console.log(req.body.event);
            res.send('');
        }
    }
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

app.listen(port, () => {
    console.log(`Twitch Eventsub Webhook listening on port ${port}`);
});

let db;
if (process.env.testing === 'true') {
    db = new Database('database.db', { verbose: console.log });
} else {
    db = new Database('dataabse.db');
}

// set up the databse
// the setup script will run everytime the bot starts.
// Take care that it will not overwrite data and will always work or the bot may not start
const setupScript = fs.readFileSync('src/dbsetup.sql', 'utf-8');
db.exec(setupScript);

const twitchBot = new TwitchBot.TwitchBot(db);
const publicQuotesBot = new PublicQuotesBot(db);
twitchBot.setupDb(db);
const discordBot = new DiscordBot(db);

// Ensure that the database connection is closed when the process terminates
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

import bodyParser from 'body-parser';
import express from 'express';
import { apiEnabled } from './Environment';
import { notification } from './lib/EventSubHandlers';
import { logInfo } from './Logger';
import { QuotesCore } from './modules/quotes/QuotesCore';
import { db } from './System';
// import { DiscordBot } from './discord/DiscordBot';
// import { PublicQuotesBot } from './twitch/PublicQuotesBot';
import api from './api/API';
import TwitchBot from './twitch/TwitchBot';

const app = express();
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        // expose the raw body of the request for signature verification
        req.rawBody = buf;
    },
}));

const port = 8081;

const quotesCore = new QuotesCore();
quotesCore.initialize(db);
app.set('quotesCore', quotesCore);

const twitchBot = new TwitchBot.TwitchBot(db);
// const publicQuotesBot = new PublicQuotesBot(db);
// twitchBot.setupDb(db);
// const discordBot = new DiscordBot(db);

if (apiEnabled) {
    app.use('/api', api);
    app.post('/notification', notification);

    app.listen(port, async () => {
        logInfo(`Twitch Eventsub Webhook listening on port ${port}`);
    });
}

process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export { };

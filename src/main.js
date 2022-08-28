import { notification } from './lib/EventSubHandlers';
import { apiEnabled } from './Environment';
import { db } from './System';

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

const fs = require('fs');
const { QuotesCore } = require('./modules/quotes/QuotesCore');
const { DiscordBot } = require('./discord/DiscordBot');
const { PublicQuotesBot } = require('./twitch/PublicQuotesBot');
const TwitchBot = require('./twitch/TwitchBot');
const { TwitchAPI } = require('./api/twitch/TwitchAPI');
const { TwitchOAuth } = require('./api/twitch/TwitchOAuth');
const api = require('./api/API');

const port = 8081;

const clientId = process.env.TWITCH_CLIENT_ID;
const authToken = process.env.AUTH_TOKEN;
const ngrokUrl = process.env.NGROK_URL;
const secret = process.env.SECRET;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const channelAuth = process.env.CHANNEL_AUTH;

// const eventSubListener = new EventSubListener({
//     apiClient,
//     adapter: new ReverseProxyAdapter({
//         hostName: ngrokUrl,
//     }),
//     secret,
// });

// app.set('userManager', userManager);
// app.set('tokenManager', tokenManager);
// app.set('redemptionsManager', redemptionsManager);
// app.set('economyRedemptionsManager', economyRedemptionsManager);
// app.set('apiClient', apiClient);
// app.set('clientId', clientId);
// app.set('eventSubManager', eventSubManager);

const quotesCore = new QuotesCore();
quotesCore.initialize(db);
app.set('quotesCore', quotesCore);

// const economyCore = new EconomyCore(db);
// app.set('economyCore', economyCore);
//
const twitchBot = new TwitchBot.TwitchBot(db);
// const publicQuotesBot = new PublicQuotesBot(db);
// twitchBot.setupDb(db);
// const discordBot = new DiscordBot(db);

if (apiEnabled) {
    app.use('/api', api);
    app.post('/notification', notification);

    app.listen(port, async () => {
        console.log(`Twitch Eventsub Webhook listening on port ${port}`);
        // await eventSubListener.listen();
        // const followSub = await eventSubListener.subscribeToChannelFollowEvents(12826, (event) => {
        //     console.log(`${event.userDisplayName} just followed ${event.broadcasterDisplayName}!`);
        // });
        // (await apiClient.eventSub.getSubscriptions()).data.forEach((sub) => {
        //     console.log(`${sub.id}: ${sub.type} when ${JSON.stringify(sub.condition)}`);
        //     const metadata = redemptionsManager.getMetadata(sub.id);
        //     const user = userManager.getUser(metadata.owner);
        //     switch (sub.type) {
        //         case 'channel.channel_points_custom_reward_redemption.add':
        //             eventSubListener.subscribeToChannelRedemptionAddEventsForReward(
        //                 sub.condition.broadcaster_user_id,
        //                 sub.condition.reward_id,
        //                 (event) => handleRedemption(event, userApiClient),
        //             );
        //             switch (metadata.module) {
        //                 case 'economy':
        //                     eventSubListener.subscribeToChannelRedemptionAddEventsForReward(
        //                         user.twitchId,
        //                         metadata.twitchRewardId,
        //                         (event) => handleRedemption(event, userApiClient),
        //                     );
        //                     break;
        //                 default:
        //                     console.log(`${metadata.module} has no handler for ${sub.type}`);
        //                     break;
        //             }
        //             break;
        //         default:
        //             console.log(`Existing eventsub subscription found for unregistered type ${sub.type}`);
        //     }
        // });
    });
}

process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export {};

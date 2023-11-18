import bodyParser from 'body-parser';
import express from 'express';
import 'http';
import path from 'path';
import { apiEnabled, port } from './Environment';
import { notification } from './lib/EventSubHandlers';
import { logInfo } from './Logger';
import { initDiscordBot } from './discord/DiscordBot';
import api from './api/API';
import { initTwitchBot } from './twitch/TwitchBot';

declare module 'express' {
    interface Request {
        rawBody: any;
    }
}

declare module 'http' {
    interface IncomingMessage {
        rawBody: any;
    }
}

const app = express();
app.use(
    bodyParser.json({
        verify: (req, res, buf) => {
            // expose the raw body of the request for signature verification
            req.rawBody = buf;
        },
    }),
);

initTwitchBot();
initDiscordBot();

if (apiEnabled) {
    app.use('/api', api);
    app.post('/notification', notification);

    app.use(express.static('static'));

    app.get('/*', (req, res) => {
        logInfo(`Client Request ${req.path}`);
        res.sendFile(path.join(__dirname, '../static', 'index.html'));
    });

    app.listen(port, async () => {
        logInfo(`Twitch Eventsub Webhook listening on port ${port}`);
    });
}

process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export {};

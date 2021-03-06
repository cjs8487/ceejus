const tmi = require('tmi.js');
const { MultiTwitch } = require('./modules/MultiTwitch');
const { TwitchQuotesModule } = require('./modules/TwitchQuotesModule');

class PublicQuotesBot {
    constructor(db) {
        this.db = db;

        this.quotesBot = new TwitchQuotesModule(db);

        const opts = {
            identity: {
                username: process.env.BOT_USERNAME,
                password: process.env.OAUTH_TOKEN,
            },
            channels: process.env.QUOTES_CHANNELS.split(','),
        };

        // eslint-disable-next-line new-cap
        this.client = new tmi.client(opts);
        this.onMessageHandler = this.onMessageHandler.bind(this);
        this.client.on('message', this.onMessageHandler);
        this.client.on('connected', this.onConnectedHandler);

        this.client.connect();
    }

    // eslint-disable-next-line class-methods-use-this
    onConnectedHandler(addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    }

    onMessageHandler(channel, user, message, self) {
        if (self) {
            return;
        }

        let commandName = message.trim();

        if (!commandName.startsWith('!')) {
            return;
        }

        const commandParts = message.substring(1).split(' ');
        commandName = commandParts[0].toLowerCase();

        if (commandName === 'quote') {
            // pass the message on to the quotes bot to handle
            // we remove the !quote because the bot assumes that the message has already been parsed
            const mod = false;
            const quoteResponse = this.quotesBot.handleCommand(commandParts.slice(1), user.username, mod);
            if (quoteResponse === '') {
                return;
            }
            this.client.say(
                channel,
                `@${user.username} ${quoteResponse}`,
            );
        } else if (commandName === 'multi') {
            // pass the message on to the quotes bot to handle
            // we remove the !quote because the bot assumes that the message has already been parsed
            const mod = false;
            const multiResponse = MultiTwitch.INSTANCE.handleCommand(commandParts.slice(1), user.username, mod);
            if (multiResponse === '') {
                return;
            }
            this.client.say(
                channel, `${multiResponse}`,
            );
        }
    }
}

module.exports.PublicQuotesBot = PublicQuotesBot;
const tmi = require('tmi.js');
const { flagToEvent, getBiTInfo, lookupFlag } = require('ss-scene-flags');
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
            const quoteResponse = this.quotesBot.handleCommand(
                commandParts.slice(1),
                user.username,
                mod,
            );
            if (quoteResponse === '') {
                return;
            }
            this.client.say(channel, `@${user.username} ${quoteResponse}`);
        } else if (commandName === 'multi') {
            // pass the message on to the quotes bot to handle
            // we remove the !quote because the bot assumes that the message has already been parsed
            const mod = false;
            const multiResponse = MultiTwitch.INSTANCE.handleCommand(
                commandParts.slice(1),
                user.username,
                mod,
            );
            if (multiResponse === '') {
                return;
            }
            this.client.say(channel, `${multiResponse}`);
        } else if (commandName === 'flags') {
            if (commandParts[1] === 'event') {
                try {
                    const event = flagToEvent(
                        commandParts[2],
                        commandParts.slice(3).join(' '),
                    );
                    if (event.length === 0) {
                        this.client.say(
                            channel,
                            `@${user.username} flag does not exist on the specified map`,
                        );
                    }
                    this.client.say(channel, `@${user.username} ${event}`);
                } catch (e) {
                    this.client.say(
                        channel,
                        `@${user.username} invalid map or flag specified`,
                    );
                }
            } else if (commandParts[1] === 'bit') {
                try {
                    const info = getBiTInfo(
                        commandParts[2],
                        commandParts.slice(3).join(' '),
                    );
                    if (info.length === 0) {
                        this.client.say(
                            channel,
                            `@${user.username} flag is not reachable in BiT`,
                        );
                    }
                    let response = `@${user.username}`;
                    _.forEach(info, (infoString) => {
                        response += ` ${infoString}`;
                    });
                    this.client.say(channel, response);
                } catch (e) {
                    this.client.say(
                        channel,
                        `@${user.username} invalid flag specified`,
                    );
                }
            } else if (commandParts[1] === 'lookup') {
                try {
                    const results = lookupFlag(
                        commandParts[2],
                        commandParts.slice(3).join(' '),
                        true,
                    );
                    if (results.length === 0) {
                        this.client.say(
                            channel,
                            `@${user.username} flag is not reachable in BiT`,
                        );
                    }
                    let response = `@${user.username}`;
                    _.forEach(results, (result) => {
                        response += ` ${result}`;
                    });
                    this.client.say(channel, response);
                } catch (e) {
                    this.client.say(
                        channel,
                        `@${user.username} invalid map specified`,
                    );
                }
            }
        }
    }
}

module.exports.PublicQuotesBot = PublicQuotesBot;

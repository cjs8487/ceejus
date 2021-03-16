const tmi = require('tmi.js');

class TwitchBot {
    constructor() {
        const opts = {
            identity: {
                username: process.env.BOT_USERNAME,
                password: process.env.OAUTH_TOKEN,
            },
            channels: [process.env.CHANNEL_NAME],
        };

        this.client = new tmi.client(opts);
        this.onMessageHandler = this.onMessageHandler.bind(this);
        this.client.on('message', this.onMessageHandler);
        this.client.on('connected', this.onConnectedHandler);

        this.client.connect();

        this.commands = {};
    }

    onMessageHandler(target, context, msg, self) {
        if (self) {
            return;
        }

        // TODO: TIMED MESSAGE HANDLING

        let commandName = msg.trim();

        if (!commandName.startsWith('!')) {
        // not a command
        // TODO: MODERATION?
            return;
        }

        commandName = msg.substring(1);

        if (commandName === 'lurk') {
            this.client.say(
                target,
                `${context.username} is lurking in the shadows, 
                    silently supporting the stream`,
            );
        } else if (commandName === 'unlurk') {
            this.client.say(
                target,
                `${context.username} has returned from the shadows`,
            );
        } else if (commandName === 'discord') {
        // TODO: DISCORD LINK
        } else if (commandName === 'highlight') {
        // TODO: HILIGHT PROCESSING
        }
    }

    // eslint-disable-next-line class-methods-use-this
    onConnectedHandler(addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    }

    // eslint-disable-next-line class-methods-use-this
    setupDb(db) {
        const commandsFromDb = db.prepare('select * from commands').all();
        console.log(commandsFromDb);
    }
}

module.exports.TwitchBot = TwitchBot;

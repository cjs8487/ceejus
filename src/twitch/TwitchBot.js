const tmi = require('tmi.js');
const fs = require('fs');
const QuotesBot = require('./modules/quotes/QuotesBot');

class TwitchBot {
    constructor() {
        const opts = {
            identity: {
                username: process.env.BOT_USERNAME,
                password: process.env.OAUTH_TOKEN,
            },
            channels: [process.env.CHANNEL_NAME],
        };

        // eslint-disable-next-line new-cap
        this.client = new tmi.client(opts);
        this.onMessageHandler = this.onMessageHandler.bind(this);
        this.client.on('message', this.onMessageHandler);
        this.client.on('connected', this.onConnectedHandler);

        this.client.connect();

        this.quotesBot = new QuotesBot.QuotesBot(this.client);
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

        const commandParts = msg.substring(1).split(' ');
        commandName = commandParts[0];

        if (commandName === 'lurk') {
            this.client.say(
                target,
                `@${context.username} is lurking in the shadows, silently supporting the stream`,
            );
        } else if (commandName === 'unlurk') {
            this.client.say(
                target,
                `@${context.username} has returned from the shadows`,
            );
        } else if (commandName === 'addcomm') {
            if (!TwitchBot.isUserMod(context, target)) return;
            const newCommand = commandParts[1];
            const output = commandParts.slice(2).join(' ');
            this.db.prepare('insert into commands (command_string, output) values (?, ?)').run(newCommand, output);
            this.client.say(
                target,
                `@${context.username} command !${newCommand} successfully created`,
            );
        } else if (commandName === 'editcomm') {
            if (!TwitchBot.isUserMod(context, target)) return;
            const editCommand = commandParts[1];
            const output = commandParts.slice(2).join(' ');
            this.db.prepare('update commands set output=? where command_string=?').run(output, editCommand);
            this.client.say(
                target,
                `@${context.username} command !${editCommand} editted successfully`,
            );
        } else if (commandName === 'deletecomm') {
            if (!TwitchBot.isUserMod(context, target)) return;
            const deleteCommand = commandParts[1];
            this.db.prepare('delete from commands where command_string=?').run(deleteCommand);
            this.client.say(
                target,
                `@${context.username} command !${deleteCommand} deleted sucessfully`,
            );
        } else if (commandName === 'cjquote') {
            // pass the message on to the quotes bot to handle
            // we remove the !quote because the bot assumes that the message has already been parsed
            this.quotesBot.handleMessage(target, context, commandParts.slice(1));
        } else {
            // standard text commands
            const response = this.db.prepare('select output from commands where command_string=?').get(commandName);
            if (response === undefined) return; // invalid command
            this.client.say(target, response.output);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    onConnectedHandler(addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    }

    setupDb(db) {
        this.db = db;
        const commands = this.db.prepare('select * from commands');
        if (commands === undefined) {
            const setupScript = fs.readFileSync('src/twitch/initalCommandSetup.sql', 'utf-8');
            db.exec(setupScript);
        }
        this.quotesBot.setupDb(db);
    }

    static isUserMod(user, channel) {
        const mod = user.mod || user['user-type'] === 'mod';
        const me = channel.slice(1) === user.username;
        return mod || me;
    }
}

module.exports.TwitchBot = TwitchBot;

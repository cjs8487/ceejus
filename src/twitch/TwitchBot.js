const _ = require('lodash');
const tmi = require('tmi.js');
const fs = require('fs');
const { isUserMod } = require('./TwitchHelper');
const { TwitchQuotesModule } = require('./modules/TwitchQuotesModule');
const { MultiTwitch } = require('./modules/MultiTwitch');

const paramRegex = /(?:\$param(?<index>\d*))/g;

/**
 * IRC Chatbot run through Twitch. This serves as the main entry point into the Twitch modules of the bot, but most
 * functionality is broken out into those modules.
 */
class TwitchBot {
    /**
     * Constructs a new Twitch bot isntance, using the environment variables to contruct the instance
     * @param {*} db The database to use when looking up information for the bot (commands, quotes, etc.)
     */
    constructor(db) {
        this.db = db;
        this.quotesBot = new TwitchQuotesModule();
        this.multiModule = new MultiTwitch();
        this.modules = [];

        const opts = {
            identity: {
                username: process.env.BOT_USERNAME,
                password: process.env.OAUTH_TOKEN,
            },
            channels: process.env.CHANNEL_NAME.split(','),
        };

        // eslint-disable-next-line new-cap
        this.client = new tmi.client(opts);
        this.onMessageHandler = this.onMessageHandler.bind(this);
        this.client.on('message', this.onMessageHandler);
        this.client.on('connected', this.onConnectedHandler);

        this.client.connect();
    }

    /**
     * Handles an incoming chat messsage
     * @param {*} channel The channel the message was sent in
     * @param {*} user The user who sent the message
     * @param {*} message The message that was sent
     * @param {boolean} self true if the message was sent by the bot
     */
    onMessageHandler(channel, user, message, self) {
        if (self) {
            return;
        }

        // TODO: TIMED MESSAGE HANDLING

        let commandName = message.trim();

        if (!commandName.startsWith('!')) {
            // not a command
            // TODO: MODERATION?
            return;
        }

        const commandParts = message.substring(1).split(' ');
        commandName = commandParts[0].toLowerCase();

        let handled = false;
        _.forEach(this.modules, (module) => {
            if (module.recognizesCommand(commandName)) {
                module.handleCommand(commandParts);
                handled = true;
            }
        });
        if (handled) return;

        if (commandName === 'lurk') {
            this.client.say(
                channel,
                `@${user.username} is lurking in the shadows, silently supporting the stream`,
            );
        } else if (commandName === 'unlurk') {
            this.client.say(
                channel,
                `@${user.username} has returned from the shadows`,
            );
        } else if (commandName === 'addcomm') {
            if (!isUserMod(user, channel)) return;
            const newCommand = commandParts[1].toLowerCase();
            const output = commandParts.slice(2).join(' ');
            this.db.prepare('insert into commands (command_string, output) values (?, ?)').run(newCommand, output);
            this.client.say(
                channel,
                `@${user.username} command !${newCommand} successfully created`,
            );
        } else if (commandName === 'editcomm') {
            if (!isUserMod(user, channel)) return;
            const editCommand = commandParts[1].toLowerCase();
            const output = commandParts.slice(2).join(' ');
            this.db.prepare('update commands set output=? where command_string=?').run(output, editCommand);
            this.client.say(
                channel,
                `@${user.username} command !${editCommand} editted successfully`,
            );
        } else if (commandName === 'deletecomm') {
            if (!isUserMod(user, channel)) return;
            const deleteCommand = commandParts[1].toLowerCase();
            this.db.prepare('delete from commands where command_string=?').run(deleteCommand);
            this.client.say(
                channel,
                `@${user.username} command !${deleteCommand} deleted sucessfully`,
            );
        } else if (commandName === 'quote') {
            // pass the message on to the quotes bot to handle
            // we remove the !quote because the bot assumes that the message has already been parsed
            const mod = isUserMod(user, channel);
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
            const mod = isUserMod(user, channel);
            const multiResponse = this.multiModule.handleCommand(commandParts.slice(1), user.username, mod);
            if (multiResponse === '') {
                return;
            }
            this.client.say(
                channel,
                `${multiResponse}`,
            );
        } else {
            // standard text commands
            const response = this.db.prepare('select output from commands where command_string=?').get(commandName);
            if (response === undefined) return; // invalid command
            // parse argument based commands
            let success = true;
            const parsed = response.output.replaceAll(paramRegex, (match, p1) => {
                if (p1 === 'undefined') {
                    success = false;
                }
                return commandParts[_.toNumber(p1) + 1];
            });
            if (success) {
                this.client.say(channel, parsed);
            } else {
                this.client.say(channel, `@${user.username} incorrect syntax for command ${commandName}`);
            }
        }
    }

    /**
     * Callback for a successful connection to the irc server
     * @param {*} addr The address of the irc server the bot connected to
     * @param {*} port The port on the server we are connected through
     */
    // eslint-disable-next-line class-methods-use-this
    onConnectedHandler(addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    }

    /**
     * Checks the database for existing data and loads the initial dataset if the is no data present
     */
    setupDb() {
        const commands = this.db.prepare('select * from commands');
        if (commands === undefined) {
            const setupScript = fs.readFileSync('src/twitch/initalCommandSetup.sql', 'utf-8');
            this.db.exec(setupScript);
        }
    }
}

module.exports.TwitchBot = TwitchBot;

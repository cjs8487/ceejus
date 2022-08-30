import { handleEconomyCommand } from '../modules/Modules';
import TwitchEconomyModule from './modules/TwitchEconomyModule.ts';

const _ = require('lodash');
const fetch = require('node-fetch');
const tmi = require('tmi.js');
const fs = require('fs');
const { flagToEvent, getBiTInfo, lookupFlag } = require('ss-scene-flags');
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
    constructor(db, economyCore) {
        this.db = db;
        this.quotesBot = new TwitchQuotesModule();
        this.multiModule = new MultiTwitch();
        this.modules = new Map();
        this.modules.set(['money', 'gamble', 'give', 'net'], handleEconomyCommand);

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
    async onMessageHandler(channel, user, message, self) {
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

        const mod = isUserMod(user, channel);
        let handled = false;
        this.modules.forEach(async (delegate, commands) => {
            handled = true;
            if (_.includes(commands, commandName)) {
                this.client.say(
                    channel,
                    await delegate(commandParts, user.username, mod, ['cjs0789']),
                );
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
        } else if (commandName === 'flags') {
            if (commandParts[1] === 'event') {
                try {
                    const event = flagToEvent(commandParts[2], commandParts.slice(3).join(' '));
                    if (event.length === 0) {
                        this.client.say(channel, `@${user.username} flag does not exist on the specified map`);
                    }
                    this.client.say(channel, `@${user.username} ${event}`);
                } catch (e) {
                    this.client.say(channel, `@${user.username} invalid map or flag specified`);
                }
            } else if (commandParts[1] === 'bit') {
                try {
                    const info = getBiTInfo(commandParts[2], commandParts.slice(3).join(' '));
                    if (info.length === 0) {
                        this.client.say(channel, `@${user.username} flag is not reachable in BiT`);
                    }
                    let response = `@${user.username}`;
                    _.forEach(info, (infoString) => {
                        response += ` ${infoString}`;
                    });
                    this.client.say(channel, response);
                } catch (e) {
                    this.client.say(channel, `@${user.username} invalid flag specified`);
                }
            } else if (commandParts[1] === 'lookup') {
                try {
                    const results = lookupFlag(commandParts[2], commandParts.slice(3).join(' '), true);
                    if (results.length === 0) {
                        this.client.say(channel, `@${user.username} flag is not reachable in BiT`);
                    }
                    let response = `@${user.username}`;
                    _.forEach(results, (result) => {
                        response += ` ${result}`;
                    });
                    this.client.say(channel, response);
                } catch (e) {
                    this.client.say(channel, `@${user.username} invalid map specified`);
                }
            }
        } else if (commandName === 'floha') {
            let quote;
            if (commandParts.length > 1) {
                const quoteNumber = parseInt(commandParts[1], 10);
                if (Number.isNaN(quoteNumber)) {
                    quote = await (
                        await fetch(
                            `https://flohabot.bingothon.com/api/quotes/quote?alias=${commandParts.slice(1).join(' ')}`,
                        )
                    ).json();
                } else {
                    quote = await (
                        await fetch(`https://flohabot.bingothon.com/api/quotes/quote?quoteNumber=${quoteNumber}`)
                    ).json();
                }
            } else {
                quote = await (await fetch('https://flohabot.bingothon.com/api/quotes/quote')).json();
            }
            this.client.say(channel, `@${user.username} #${quote.id}: ${quote.quote_text}`);
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

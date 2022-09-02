import { ChatClient } from '@twurple/chat';
import { Database } from 'better-sqlite3';
import { StaticAuthProvider } from '@twurple/auth';
import { User } from '../database/UserManager';
import { userManager } from '../System';
import { handleEconomyCommand, HandlerDelegate } from '../modules/Modules';
import { MultiTwitch } from './modules/MultiTwitch';
import { TwitchQuotesModule } from './modules/TwitchQuotesModule';
import { botOAuthToken, botUsername, twitchClientId } from '../Environment';

const _ = require('lodash');
const fetch = require('node-fetch');
const tmi = require('tmi.js');
const fs = require('fs');
const { flagToEvent, getBiTInfo, lookupFlag } = require('ss-scene-flags');
const { isUserMod } = require('./TwitchHelper');

const paramRegex = /(?:\$param(?<index>\d*))/g;

/**
 * IRC Chatbot run through Twitch. This serves as the main entry point into the Twitch modules of the bot, but most
 * functionality is broken out into those modules.
 */
class TwitchBot {
    db: Database;
    quotesBot: TwitchQuotesModule;
    multiModule: MultiTwitch;
    modules: Map<string[], HandlerDelegate>;
    client: ChatClient;

    /**
     * Constructs a new Twitch bot isntance, using the environment variables to contruct the instance
     * @param {*} db The database to use when looking up information for the bot (commands, quotes, etc.)
     */
    constructor(db: Database) {
        this.db = db;
        this.quotesBot = new TwitchQuotesModule();
        this.multiModule = new MultiTwitch();
        this.modules = new Map();
        this.modules.set(['money', 'gamble', 'give', 'net'], handleEconomyCommand);

        // const opts = {
        //     identity: {
        //         username: process.env.BOT_USERNAME,
        //         password: process.env.OAUTH_TOKEN,
        //     },
        //     channels: process.env.CHANNEL_NAME.split(','),
        // };
        //
        // eslint-disable-next-line new-cap
        // this.client = new tmi.client(opts);
        // this.onMessageHandler = this.onMessageHandler.bind(this);
        // this.client.on('message', this.onMessageHandler);
        // this.client.on('connected', this.onConnectedHandler);

        // this.client.connect();

        const channels: string[] = userManager.getAllUsers(true).map((user: User) => user.username);
        console.log(channels);
        this.client = new ChatClient({
            authProvider: new StaticAuthProvider(twitchClientId, botOAuthToken),
            channels,
        });

        this.onMessageHandler = this.onMessageHandler.bind(this);

        this.client.onMessage(this.onMessageHandler);
        this.client.connect();
    }

    /**
     * Handles an incoming chat messsage
     * @param {*} channel The channel the message was sent in
     * @param {*} user The user who sent the message
     * @param {*} message The message that was sent
     */
    async onMessageHandler(channel: string, user: string, message: string) {
        if (user === botUsername) {
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
            if (_.includes(commands, commandName)) {
                handled = true;
                this.client.say(
                    channel,
                    await delegate(commandParts, user, mod, 'cjs0789'),
                );
            }
        });
        if (handled) return;

        if (commandName === 'lurk') {
            this.client.say(
                channel,
                `@${user} is lurking in the shadows, silently supporting the stream`,
            );
        } else if (commandName === 'unlurk') {
            this.client.say(
                channel,
                `@${user} has returned from the shadows`,
            );
        } else if (commandName === 'addcomm') {
            if (!isUserMod(user, channel)) return;
            const newCommand = commandParts[1].toLowerCase();
            const output = commandParts.slice(2).join(' ');
            this.db.prepare('insert into commands (command_string, output) values (?, ?)').run(newCommand, output);
            this.client.say(
                channel,
                `@${user} command !${newCommand} successfully created`,
            );
        } else if (commandName === 'editcomm') {
            if (!isUserMod(user, channel)) return;
            const editCommand = commandParts[1].toLowerCase();
            const output = commandParts.slice(2).join(' ');
            this.db.prepare('update commands set output=? where command_string=?').run(output, editCommand);
            this.client.say(
                channel,
                `@${user} command !${editCommand} editted successfully`,
            );
        } else if (commandName === 'deletecomm') {
            if (!isUserMod(user, channel)) return;
            const deleteCommand = commandParts[1].toLowerCase();
            this.db.prepare('delete from commands where command_string=?').run(deleteCommand);
            this.client.say(
                channel,
                `@${user} command !${deleteCommand} deleted sucessfully`,
            );
        } else if (commandName === 'quote') {
            // pass the message on to the quotes bot to handle
            // we remove the !quote because the bot assumes that the message has already been parsed
            const quoteResponse = this.quotesBot.handleCommand(commandParts.slice(1), user, mod);
            if (quoteResponse === '') {
                return;
            }
            this.client.say(
                channel,
                `@${user} ${quoteResponse}`,
            );
        } else if (commandName === 'multi') {
            // pass the message on to the quotes bot to handle
            // we remove the !quote because the bot assumes that the message has already been parsed
            const multiResponse = this.multiModule.handleCommand(commandParts.slice(1), user, mod);
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
                        this.client.say(channel, `@${user} flag does not exist on the specified map`);
                    }
                    this.client.say(channel, `@${user} ${event}`);
                } catch (e) {
                    this.client.say(channel, `@${user} invalid map or flag specified`);
                }
            } else if (commandParts[1] === 'bit') {
                try {
                    const info = getBiTInfo(commandParts[2], commandParts.slice(3).join(' '));
                    if (info.length === 0) {
                        this.client.say(channel, `@${user} flag is not reachable in BiT`);
                    }
                    let response = `@${user}`;
                    _.forEach(info, (infoString: string) => {
                        response += ` ${infoString}`;
                    });
                    this.client.say(channel, response);
                } catch (e) {
                    this.client.say(channel, `@${user} invalid flag specified`);
                }
            } else if (commandParts[1] === 'lookup') {
                try {
                    const results = lookupFlag(commandParts[2], commandParts.slice(3).join(' '), true);
                    if (results.length === 0) {
                        this.client.say(channel, `@${user} flag is not reachable in BiT`);
                    }
                    let response = `@${user}`;
                    _.forEach(results, (result: string) => {
                        response += ` ${result}`;
                    });
                    this.client.say(channel, response);
                } catch (e) {
                    this.client.say(channel, `@${user} invalid map specified`);
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
            this.client.say(channel, `@${user} #${quote.id}: ${quote.quote_text}`);
        } else {
            // standard text commands
            const response = this.db.prepare('select output from commands where command_string=?').get(commandName);
            if (response === undefined) return; // invalid command
            // parse argument based commands
            let success = true;
            const parsed = response.output.replaceAll(paramRegex, (match: string, p1: string) => {
                if (p1 === 'undefined') {
                    success = false;
                }
                return commandParts[_.toNumber(p1) + 1];
            });
            if (success) {
                this.client.say(channel, parsed);
            } else {
                this.client.say(channel, `@${user} incorrect syntax for command ${commandName}`);
            }
        }
    }

    /**
     * Callback for a successful connection to the irc server
     * @param {*} addr The address of the irc server the bot connected to
     * @param {*} port The port on the server we are connected through
     */
    // eslint-disable-next-line class-methods-use-this
    onConnectedHandler(addr: string, port: number) {
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

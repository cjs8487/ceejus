const Discord = require('discord.js');
const { DiscordQuotesModule } = require('./modules/DiscordQuotesModule');

const prefix = '!';
const testChannel = '755894973987291176';

/**
 * An IRC bot operating on the Discord platform. This bot can ooperate on the same (or different) database as any of the
 * bots. The bot expects some form of structure to the database - the same structure as is defined in the databse
 * initialization script. Avoid changing what database is used by this bot unless it is completely necessary, and you
 * know what you are doing.
 */
class DiscordBot {
    /**
     * Constructs a new bot operating on Discord
     * @param {*} db the bot's database
     */
    constructor(db) {
        this.db = db;
        const client = new Discord.Client();

        if (process.env.testing === 'true') {
            this.testMode = true;
        } else {
            this.testMode = false;
        }

        client.once('ready', () => {
            console.log('Ready!');
            if (this.testMode) {
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `Test Mode (v${process.env.npm_package_version})`,
                    },
                });
            } else {
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `Ceejus v${process.env.npm_package_version}`,
                    },
                });
            }
        });

        client.login(process.env.DISCORD_TOKEN);
        this.handleMessage = this.handleMessage.bind(this);
        this.quotesModule = new DiscordQuotesModule();

        client.on('message', this.handleMessage);
    }

    /**
     * Handles an incoming message
     * @param {*} message The message to handle. Contains all the necessary information for proper handling (comes
     * directly from Discord)
     */
    handleMessage(message) {
        if (!message.content.startsWith(prefix) || message.author.bot) return;
        if (this.testMode) {
            if (message.channel.id !== testChannel) {
                console.log('testing is enabled, ignoring normal usage');
                return;
            }
        }
        const args = message.content.slice(prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();

        if (command === 'quote') {
            message.channel.send(this.quotesModule.handleCommand(args, message.author.username, false));
        }
    }
}

module.exports.DiscordBot = DiscordBot;

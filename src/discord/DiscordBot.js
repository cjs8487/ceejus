const Discord = require('discord.js');
const { QuotesBot } = require('../modules/quotes/QuotesBot');

const prefix = '$';
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
        this.quotesBot = new QuotesBot(db);

        const client = new Discord.Client();

        client.once('ready', () => {
            console.log('Ready!');
        });

        client.login(process.env.DISCORD_TOKEN);
        this.handleMessage = this.handleMessage.bind(this);

        client.on('message', this.handleMessage);
    }

    /**
     * Handles an incoming message
     * @param {*} message The message to handle. Contains all the necessary information for proper handling (comes
     * directly from Discord)
     */
    handleMessage(message) {
        if (!message.content.startsWith(prefix) || message.author.bot) return;
        if (process.env.testing === 'true') {
            // console.log(message.channel.id)
            if (message.channel.id !== testChannel) {
                console.log('testing is enabled, ignoring normal usage');
                return;
            }
        }
        const args = message.content.slice(prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();

        if (command === 'quote') {
            const quoteResponse = this.quotesBot.handleMessage(args, false);
            if (quoteResponse === '') {
                return;
            }
            message.channel.send(`${quoteResponse}`);
        }
    }
}

module.exports.DiscordBot = DiscordBot;

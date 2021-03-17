const Discord = require('discord.js');
const { QuotesBot } = require('../modules/quotes/QuotesBot');

const prefix = '$';

class DiscordBot {
    constructor(db) {
        this.db = db;
        this.quotesBot = new QuotesBot(db);

        const client = new Discord.Client();

        client.once('ready', () => {
            console.log('Ready!');
        });

        client.login(process.env.DISCORD_TOKEN);

        client.on('message', (message) => {
            if (!message.content.startsWith(prefix) || message.author.bot) return;
            const args = message.content.slice(prefix.length).trim().split(' ');
            const command = args.shift().toLowerCase();

            if (command === 'quote') {
                message.channel.send(`${this.quotesBot.handleMessage(args, false)}`);
            }
        });
    }
}

module.exports.DiscordBot = DiscordBot;

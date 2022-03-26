const https = require('https');
const fetch = require('node-fetch');
const { Client } = require('discord.js');
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
        const client = new Client({
            intents: 32767,
        });

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
                    activities: [{
                        name: `Test Mode (v${process.env.npm_package_version})`,
                    }],
                });
            } else {
                client.user.setPresence({
                    status: 'online',
                    activities: [{
                        name: `Ceejus v${process.env.npm_package_version}`,
                    }],
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
    async handleMessage(message) {
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
            message.channel.send(
                {
                    content: `${message.author}`,
                    embeds: [this.quotesModule.handleCommand(args, message.author.username, false)],
                },
            );
        }

        if (command === 'floha') {
            const quote = await (await fetch('https://flohabot.bingothon.com/api/quotes/quote')).json();
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor({ name: 'Flohabot - Quotes' })
                .setTitle(`Quote #${quote.id}`)
                .setDescription(quote.quote_text)
                .addFields(
                    // { name: 'Quoted by', value: quote.quotedBy, inline: true },
                    { name: 'Quoted on', value: quote.creation_date, inline: true },
                )
                .setFooter({ text: `Also known as: ${quote.alias}` });
            message.channel.send(
                {
                    content: `${message.author}`,
                    embeds: [embed],
                },
            );
        }

        if (command === 'gdq') {
            https.get('https://taskinoz.com/gdq/api/', (result) => {
                result.setEncoding('utf8');
                result.on('data', (d) => {
                    message.channel.send(d);
                });
                result.on('error', () => {
                    message.channel.send('Failed to fetch inforation from the server. Try gain later.');
                });
            });
        }
    }
}

module.exports.DiscordBot = DiscordBot;

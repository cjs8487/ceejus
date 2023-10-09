import { Database } from 'better-sqlite3';
import Discord, { Client, GatewayIntentBits, Message } from 'discord.js';
import https from 'https';
import { logInfo } from '../Logger';
import { discordToken, testing } from '../Environment';
import { handleQuoteCommand } from '../modules/Modules';
import { formatQuoteResponse } from './DiscordFormatter';
import onInteraction from './handlers/Interactionhandler';

const prefix = '!';
const testChannel = '755894973987291176';

/**
 * An IRC bot operating on the Discord platform. This bot can ooperate on the same (or different) database as any of the
 * bots. The bot expects some form of structure to the database - the same structure as is defined in the databse
 * initialization script. Avoid changing what database is used by this bot unless it is completely necessary, and you
 * know what you are doing.
 */
class DiscordBot {
    db: Database;
    /**
     * Constructs a new bot operating on Discord
     * @param {*} db the bot's database
     */
    constructor(db: Database) {
        this.db = db;
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ],
        });

        client.once('ready', () => {
            logInfo('Discord module ready and active');
            if (testing) {
                client.user?.setPresence({
                    status: 'online',
                    activities: [
                        {
                            name: `Test Mode (v${process.env.npm_package_version})`,
                        },
                    ],
                });
            } else {
                client.user?.setPresence({
                    status: 'online',
                    activities: [
                        {
                            name: `Ceejus v${process.env.npm_package_version}`,
                        },
                    ],
                });
            }
        });

        client.login(discordToken);
        this.handleMessage = this.handleMessage.bind(this);

        client.on('message', this.handleMessage);
        client.on('interactionCreate', onInteraction);
    }

    /**
     * Handles an incoming message
     * @param {*} message The message to handle. Contains all the necessary information for proper handling (comes
     * directly from Discord)
     */
    // eslint-disable-next-line class-methods-use-this
    async handleMessage(message: Message) {
        if (!message.content.startsWith(prefix) || message.author.bot) return;
        if (testing) {
            if (message.channel.id !== testChannel) {
                logInfo('testing is enabled, ignoring normal usage');
                return;
            }
        }
        const args = message.content.slice(prefix.length).trim().split(' ');
        const command = args.shift()?.toLowerCase();

        if (command === 'quote') {
            message.channel.send(
                {
                    content: `${message.author}`,
                    embeds: [
                        formatQuoteResponse(
                            await handleQuoteCommand(
                                args,
                                message.author.username,
                                false,
                            ),
                        ),
                    ],
                },
                // await handleQuoteCommand(args, message.author.username, false),
            );
        }

        // if (command === 'floha') {
        //     let quote;
        //     if (args.length > 0) {
        //         const quoteNumber = parseInt(args[0], 10);
        //         if (Number.isNaN(quoteNumber)) {
        //             const response =
        //                 await fetch(`https://flohabot.bingothon.com/api/quotes/quote?alias=${args.join(' ')}`);
        //             if (!response.ok) {
        //                 const embed = new Discord.MessageEmbed()
        //                     .setColor('#ff0000')
        //                     .setAuthor({ name: 'Ceejus - Remote Quotes' })
        //                     .setTitle(`Error ${response.status}`)
        //                     .setDescription('Oh no an error ocurred. Please try again later');
        //                 message.channel.send(
        //                     {
        //                         content: `${message.author}`,
        //                         embeds: [embed],
        //                     },
        //                 );
        //             } else {
        //                 quote = await response.json();
        //                 const embed = new Discord.MessageEmbed()
        //                     .setColor('#0099ff')
        //                     .setAuthor({ name: 'Flohabot - Quotes' })
        //                     .setTitle(`Quote #${quote.id}`)
        //                     .setDescription(quote.quote_text)
        //                     .addFields(
        //                         // { name: 'Quoted by', value: quote.quotedBy, inline: true },
        //                         { name: 'Quoted on', value: quote.creation_date, inline: true },
        //                     )
        //                     .setFooter({ text: `Also known as: ${quote.alias}` });
        //                 message.channel.send(
        //                     {
        //                         content: `${message.author}`,
        //                         embeds: [embed],
        //                     },
        //                 );
        //             }
        //         } else {
        //             const response =
        //                 await fetch(`https://flohabot.bingothon.com/api/quotes/quote?quoteNumber=${quoteNumber}`);
        //             if (!response.ok) {
        //                 const embed = new Discord.MessageEmbed()
        //                     .setColor('#ff0000')
        //                     .setAuthor({ name: 'Ceejus - Remote Quotes' })
        //                     .setTitle(`Error ${response.status}`)
        //                     .setDescription('Oh no an error ocurred. Please try again later');
        //                 message.channel.send(
        //                     {
        //                         content: `${message.author}`,
        //                         embeds: [embed],
        //                     },
        //                 );
        //             } else {
        //                 quote = await response.json();
        //                 const embed = new Discord.MessageEmbed()
        //                     .setColor('#0099ff')
        //                     .setAuthor({ name: 'Flohabot - Quotes' })
        //                     .setTitle(`Quote #${quote.id}`)
        //                     .setDescription(quote.quote_text)
        //                     .addFields(
        //                         // { name: 'Quoted by', value: quote.quotedBy, inline: true },
        //                         { name: 'Quoted on', value: quote.creation_date, inline: true },
        //                     )
        //                     .setFooter({ text: `Also known as: ${quote.alias}` });
        //                 message.channel.send(
        //                     {
        //                         content: `${message.author}`,
        //                         embeds: [embed],
        //                     },
        //                 );
        //             }
        //         }
        //     } else {
        //         const response = await fetch('https://flohabot.bingothon.com/api/quotes/quote');
        //         if (!response.ok) {
        //             const embed = new Discord.MessageEmbed()
        //                 .setColor('#ff0000')
        //                 .setAuthor({ name: 'Ceejus - Remote Quotes' })
        //                 .setTitle(`Error ${response.status}`)
        //                 .setDescription('Oh no an error ocurred. Please try again later');
        //             message.channel.send(
        //                 {
        //                     content: `${message.author}`,
        //                     embeds: [embed],
        //                 },
        //             );
        //         } else {
        //             quote = await response.json();
        //             const embed = new Discord.MessageEmbed()
        //                 .setColor('#0099ff')
        //                 .setAuthor({ name: 'Flohabot - Quotes' })
        //                 .setTitle(`Quote #${quote.id}`)
        //                 .setDescription(quote.quote_text)
        //                 .addFields(
        //                     // { name: 'Quoted by', value: quote.quotedBy, inline: true },
        //                     { name: 'Quoted on', value: quote.creation_date, inline: true },
        //                 )
        //                 .setFooter({ text: `Also known as: ${quote.alias}` });
        //             message.channel.send(
        //                 {
        //                     content: `${message.author}`,
        //                     embeds: [embed],
        //                 },
        //             );
        //         }
        //     }
        // }
    }
}

export default DiscordBot;

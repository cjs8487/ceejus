const _ = require('lodash');
const Discord = require('discord.js');
const { BotModule } = require('../../modules/BotModule');
const { QuotesCore } = require('../../modules/quotes/QuotesCore');

class DiscordQuotesModule extends BotModule {
    constructor() {
        super(['quote']);

        this.author = { name: 'Ceejus - Quotes' };
        this.permissionDeniedEmbed = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setAuthor(this.author)
            .setTitle('Permission Denied')
            .setDescription("You don't have permission to do that.")
            .setFooter({
                text: 'Mod permission check for quotes module failed',
            });
    }

    handleCommand(commandParts, sender, mod) {
        const quoteCommand = commandParts[0];
        if (quoteCommand === 'add') {
            const quote = commandParts.slice(1).join(' ');
            const number = QuotesCore.getInstance().addQuote(quote, sender);
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor(this.author)
                .setTitle(`Added quote #${number}`)
                .setDescription(quote);
        }
        if (quoteCommand === 'delete') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            const quoteNumber = parseInt(commandParts[1], 10);
            if (!QuotesCore.getInstance().deleteQuote(quoteNumber)) {
                return new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setAuthor(this.author)
                    .setTitle(`Error: ${quoteNumber} is not a number`);
            }
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor('Ceejus - Quotes')
                .setTitle(`#${quoteNumber} deleted`);
        }
        if (quoteCommand === 'edit') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            const quoteNumber = parseInt(commandParts[1], 10);
            if (Number.isNaN(quoteNumber)) {
                return new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setAuthor(this.author)
                    .setTitle(`Error: ${quoteNumber} is not a number`);
            }
            const newQuote = commandParts.splice(2).join(' ');
            QuotesCore.getInstance().editQuote(quoteNumber, newQuote);
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor(this.author)
                .setTitle(`#${quoteNumber} edited`);
        }
        if (quoteCommand === 'alias') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            const result = QuotesCore.getInstance().handleAliasRequest(
                commandParts,
                mod,
            );
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor(this.author)
                .setTitle(result);
        }
        if (quoteCommand === 'info') {
            const quoteNumber = parseInt(commandParts[1], 10);
            const results = QuotesCore.getInstance().getQuoteInfo(quoteNumber);
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor(this.author)
                .setTitle(`Quote info for #${quoteNumber}`)
                .setDescription(results);
        }
        if (quoteCommand === 'search') {
            const searchString = commandParts.slice(1).join(' ');
            const results = QuotesCore.getInstance().searchQuote(searchString);
            if (!results.includes(',') && results.includes('#')) {
                // if there is exactly one result and a result was found
                const quote = QuotesCore.getInstance().getQuote(
                    parseInt(results.slice(1), 10),
                );
                return new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setAuthor(this.author)
                    .setTitle(
                        `Search result for '${searchString}': Quote #${quote.id}`,
                    )
                    .setDescription(quote.quote)
                    .addFields(
                        {
                            name: 'Quoted by',
                            value: quote.quotedBy,
                            inline: true,
                        },
                        {
                            name: 'Quoted on',
                            value: quote.quotedOn,
                            inline: true,
                        },
                        { name: 'Requested by', value: sender, inline: true },
                    )
                    .setFooter(`Also known as: ${quote.alias}`);
            }
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor(this.author)
                .setTitle(`Search results for '${searchString}'`)
                .setDescription(results)
                .addFields({
                    name: 'Requested by',
                    value: sender,
                    inline: true,
                });
        }
        if (quoteCommand === 'latest') {
            const quote = QuotesCore.getInstance().getLatestQuote();
            return new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor({ name: 'Ceejus - Quotes' })
                .setTitle(`Quote #${quote.id}`)
                .setDescription(quote.quote)
                .addFields(
                    { name: 'Quoted by', value: quote.quotedBy, inline: true },
                    { name: 'Quoted on', value: quote.quotedOn, inline: true },
                )
                .setFooter({ text: `Also known as: ${quote.alias}` });
        }
        // looking up a quote
        let quote;
        if (commandParts.length > 0) {
            // looking for a specific quote
            const lookup = commandParts[0];
            const quoteNumber = parseInt(lookup, 10);
            if (Number.isNaN(quoteNumber)) {
                const alias = commandParts.join(' ');
                quote = QuotesCore.getInstance().getQuoteAlias(alias);
                if (_.isNil(quote)) {
                    return new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setAuthor(this.author)
                        .setTitle(`Quote with alias '${alias}' does not exist`)
                        .addFields({
                            name: 'Requested by',
                            value: sender,
                            inline: true,
                        });
                }
            } else {
                quote = QuotesCore.getInstance().getQuote(quoteNumber);
                if (_.isNil(quote)) {
                    return new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setAuthor(this.author)
                        .setTitle(`Quote #${quoteNumber} does not exist`);
                }
            }
        } else {
            quote = QuotesCore.getInstance().getRandomQuote();
        }
        return new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(this.author)
            .setTitle(`Quote #${quote.id}`)
            .setDescription(quote.quote)
            .addFields(
                { name: 'Quoted by', value: quote.quotedBy, inline: true },
                { name: 'Quoted on', value: quote.quotedOn, inline: true },
            )
            .setFooter({ text: `Also known as: ${quote.alias}` });
    }
}

module.exports.DiscordQuotesModule = DiscordQuotesModule;

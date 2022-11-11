import { EmbedAuthorData, EmbedFooterData, MessageEmbed } from 'discord.js';
import { Quote } from 'src/database/quotes/QuotesManager';

export const author = (name: string): EmbedAuthorData => ({ name });

export const footer = (text: string): EmbedFooterData => ({ text });

export const permissionDeniedEmbed = (authorName: string, message: string) => new MessageEmbed()
    .setColor('#ff0000')
    .setAuthor(author(authorName))
    .setTitle('Permission Denied')
    .setDescription('You don\'t have permission to do that.')
    .setFooter(footer(message));

const quotesAuthor = author('Ceejus - Quotes');

export const quoteCreateEmbed = () => new MessageEmbed();

export const quoteEmbed = (quote: Quote) => new MessageEmbed()
    .setColor('#0099ff')
    .setAuthor(quotesAuthor)
    .setTitle(`Quote #${quote.id}`)
    .setDescription(quote.quote)
    .setFields(
        { name: 'Quoted by', value: quote.quotedBy, inline: true },
        { name: 'Quoted on', value: quote.quotedOn, inline: true },
    )
    .setFooter({ text: `Also known as: ${quote.alias}` });

export const quoteMessageEmbed = (message: string) => new MessageEmbed()
    .setColor('#0099ff')
    .setAuthor(quotesAuthor)
    .setTitle('Results')
    .setDescription(message);

export const quoteErrorEmbed = (error: string) => new MessageEmbed()
    .setColor('#ff0000')
    .setAuthor(quotesAuthor)
    .setTitle('Something went wrong')
    .setDescription(error);

export const quoteMultiEmbed = (quotes: Quote[]) => {
    let returnString = '';
    quotes.forEach((quote) => {
        returnString += `#${quote.id}, `;
    });
    returnString = returnString.slice(0, returnString.length - 2);
    return new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(quotesAuthor)
        .setTitle('Search results')
        .setDescription(returnString);
};
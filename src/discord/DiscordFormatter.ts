import { MessageEmbed } from 'discord.js';
import { QuoteResult } from 'src/modules/Modules';
import { Quote } from '../database/quotes/QuotesManager';
import {
    permissionDeniedEmbed,
    quoteEmbed,
    quoteErrorEmbed,
    quoteMessageEmbed,
    quoteMultiEmbed,
} from './Embeds';

const quotePermDenied = permissionDeniedEmbed(
    'Ceejus - Quotes',
    'Mod permission check for quotes module failed',
);

export const formatQuoteResponse = (result: QuoteResult): MessageEmbed => {
    if ('quotes' in result) {
        return quoteMultiEmbed(result.quotes);
    }
    if ('type' in result) {
        return quotePermDenied;
    }
    if ('message' in result) {
        return quoteMessageEmbed(result.message);
    }
    if ('error' in result) {
        if (result.isPermissionDenied) {
            return quotePermDenied;
        }
        return quoteErrorEmbed(result.error);
    }
    if ('quote' in result) {
        return quoteEmbed(result);
    }
    // type -> QuoteInfo
    return quotePermDenied;
};

export default {};

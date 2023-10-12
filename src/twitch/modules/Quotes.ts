import {
    addQuote,
    deleteQuote,
    editQuote,
    handleAliasRequest,
    editQuoteInfo,
    getQuoteInfo,
    searchQuote,
    getLatestQuote,
    getQuoteAlias,
    getQuote,
    getRandomQuote,
} from '../../database/quotes/Quotes';
import { HandlerDelegate } from '../../modules/Modules';
import { replyTo } from '../TwitchUtils';
import { TwitchModule } from './TwitchModule';

const permissionDenied = "You don't have permission to do that";

const handleQuote: HandlerDelegate = async (
    commandParts: string[],
    sender: string,
) => {
    const quoteCommand = commandParts[0];
    const isQuoteMod = false;
    if (quoteCommand === 'add') {
        const quote = commandParts.slice(1).join(' ');
        const number = addQuote(quote, sender);
        return `Added quote #${number}`;
    }
    if (quoteCommand === 'delete') {
        if (!isQuoteMod) {
            return permissionDenied;
        }
        const quoteNumber = parseInt(commandParts[1], 10);
        if (!deleteQuote(quoteNumber)) {
            return `Error: ${quoteNumber} is not a number`;
        }
        return `#${quoteNumber} deleted`;
    }
    if (quoteCommand === 'edit') {
        if (!isQuoteMod) {
            return permissionDenied;
        }
        const quoteNumber = parseInt(commandParts[1], 10);
        if (Number.isNaN(quoteNumber)) {
            return `Error: ${quoteNumber} is not a number`;
        }
        const newQuote = commandParts.splice(2).join(' ');
        editQuote(quoteNumber, newQuote);
        return `#${quoteNumber} edited`;
    }
    if (quoteCommand === 'alias') {
        if (!isQuoteMod) {
            return permissionDenied;
        }
        return handleAliasRequest(commandParts, isQuoteMod);
    }
    if (quoteCommand === 'info') {
        if (commandParts[1] === 'edit') {
            if (!isQuoteMod) {
                return permissionDenied;
            }
            const quoteNumber = parseInt(commandParts[2], 10);
            const quotedOn = commandParts[3];
            const quotedBy = commandParts.slice(4).join(' ');
            editQuoteInfo(quoteNumber, quotedOn, quotedBy);
            return `info for #${quoteNumber} updated`;
        }
        const quoteNumber = parseInt(commandParts[1], 10);
        if (Number.isNaN(quoteNumber)) {
            return 'invalid paramter';
        }
        const results = getQuoteInfo(quoteNumber);
        if (results === undefined) {
            return 'no quote found';
        }
        return `info for #${results.id}: Quoted on ${results.quotedOn} by ${
            results.quotedBy
        }.${
            results.alias !== 'unknown'
                ? ` This quote is also known as ${results.alias}`
                : ''
        }`;
    }
    if (quoteCommand === 'search') {
        const searchString = commandParts.slice(1).join(' ');
        const results = searchQuote(searchString);
        if ('error' in results) {
            return results.error;
        }
        if (results.length === 1) {
            return results[0].quote;
        }
        return results.map((quote) => `#${quote.id}`).join(', ');
    }
    if (quoteCommand === 'latest') {
        const quote = getLatestQuote();
        if (!quote) {
            return 'There are no quotes';
        }
        return `#${quote.id}: ${quote.quote}`;
    }
    // looking up a quote
    let quote;
    if (commandParts.length > 0) {
        // looking for a specific quote
        const lookup = commandParts[0];
        const quoteNumber = parseInt(lookup, 10);
        if (Number.isNaN(quoteNumber)) {
            const alias = commandParts.join(' ');
            quote = getQuoteAlias(alias);
            if (!quote) {
                return `Quote with alias '${alias}' does not exist`;
            }
            return `#${quote.id} (${quote.alias}): ${quote.quote}`;
        }
        quote = getQuote(quoteNumber);
        if (!quote) {
            return "That quote doesn't exist";
        }
    } else {
        quote = getRandomQuote();
        if (!quote) {
            return 'There are no quotes';
        }
    }
    return `#${quote.id}: ${quote.quote}`;
};

const commandHandlers = new Map<string, HandlerDelegate>();
commandHandlers.set('quote', replyTo(handleQuote));

const quotesModule: TwitchModule = {
    name: 'Quotes',
    key: 'quotes',
    commandHandlers,
};

export default quotesModule;

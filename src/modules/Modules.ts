import _ from 'lodash';
import { flagToEvent, getBiTInfo, lookupFlag } from 'ss-scene-flags';
import { economyManager, quotesManager, userManager } from '../System';
import { getOrCreateUserName } from '../util/UserUtils';

/**
 * Represents a function that handles a given command or subset of commands
 */
export type HandlerDelegate = (
    commandParts: string[],
    sender: string,
    mod: boolean,
    ...metadata: string[]
) => Promise<string>;

export const handleQuoteCommand: HandlerDelegate = async (
    commandParts: string[],
    sender: string,
    mod: boolean,
    ...metadata: string[]
): Promise<string> => {
    const quoteCommand = commandParts[0];
    if (quoteCommand === 'add') {
        const quote = commandParts.slice(1).join(' ');
        const number = quotesManager.addQuote(quote, sender);
        return `Added quote #${number}`;
    }
    if (quoteCommand === 'delete') {
        if (!mod) {
            return 'You do not have permission to do that';
        }
        const quoteNumber = parseInt(commandParts[1], 10);
        if (!quotesManager.deleteQuote(quoteNumber)) {
            return `Error: ${quoteNumber} is not a number`;
        }
        return `#${quoteNumber} deleted`;
    }
    if (quoteCommand === 'edit') {
        if (!mod) {
            return 'You do not have permission to do that';
        }
        const quoteNumber = parseInt(commandParts[1], 10);
        if (Number.isNaN(quoteNumber)) {
            return `Error: ${quoteNumber} is not a number`;
        }
        const newQuote = commandParts.splice(2).join(' ');
        quotesManager.editQuote(quoteNumber, newQuote);
        return `#${quoteNumber} edited`;
    }
    if (quoteCommand === 'alias') {
        if (!mod) {
            return 'You do not have permission to do that';
        }
        return quotesManager.handleAliasRequest(commandParts, mod);
    }
    if (quoteCommand === 'info') {
        if (commandParts[1] === 'edit') {
            const quoteNumber = parseInt(commandParts[2], 10);
            const quotedOn = commandParts[3];
            const quotedBy = commandParts.slice(4).join(' ');
            quotesManager.editQuoteInfo(quoteNumber, quotedOn, quotedBy);
            return `info for #${quoteNumber} updated`;
        }
        const quoteNumber = parseInt(commandParts[1], 10);
        const results = quotesManager.getQuoteInfo(quoteNumber);
        return results;
    }
    if (quoteCommand === 'search') {
        const searchString = commandParts.slice(1).join(' ');
        const results = quotesManager.searchQuote(searchString);
        if (!results.includes(',') && results.includes('#')) {
            // if there is exactly one result and a result was found
            const quote = quotesManager.getQuote(parseInt(results.slice(1), 10));
            return `Search result: #${quote.id}: ${quote.quote}`;
        }
        return results;
    }
    if (quoteCommand === 'latest') {
        const quote = quotesManager.getLatestQuote();
        return `#${quote.id}: ${quote.quote}`;
    }
    // looking up a quote
    let quote;
    if (commandParts.length > 0) { // looking for a specific quote
        const lookup = commandParts[0];
        const quoteNumber = parseInt(lookup, 10);
        if (Number.isNaN(quoteNumber)) {
            const alias = commandParts.join(' ');
            quote = quotesManager.getQuoteAlias(alias);
            if (_.isNil(quote)) {
                return `Quote with alias '${alias}' does not exist`;
            }
            return `#${quote.id} (${quote.alias}): ${quote.quote}`;
        }
        quote = quotesManager.getQuote(quoteNumber);
        if (_.isNil(quote)) {
            return `Quote #${quoteNumber} does not exist`;
        }
    } else {
        quote = quotesManager.getRandomQuote();
    }
    return `#${quote.id}: ${quote.quote}`;
};

export const handleEconomyCommand: HandlerDelegate = async (
    commandParts: string[],
    sender: string,
    mod: boolean,
    ...metadata: string[]
): Promise<string> => {
    const command = commandParts.shift();
    const [channelName] = metadata;
    const user = await getOrCreateUserName(sender);
    const owner = userManager.getUser(channelName).userId;
    const currencyName = 'BiTcoins';
    if (command === 'money') {
        let target: string;
        if (commandParts.length > 0) {
            [target] = commandParts;
        } else {
            target = sender;
        }
        return `${economyManager.getCurrency(await getOrCreateUserName(target), owner)} ${currencyName}`;
    }
    if (command === 'gamble') {
        const [amount] = commandParts;
        const total = economyManager.getCurrency(user, owner);
        let gambleAmount: number;
        if (amount === 'all') {
            gambleAmount = total;
        } else {
            gambleAmount = Number(amount);
            if (Number.isNaN(gambleAmount)) {
                return 'You must gamble with a number or "all"';
            }
            if (gambleAmount < 0) {
                return 'Can\'t gamble a negative amount';
            }
            if (gambleAmount > total) {
                return 'Can\'t gamble more than you have';
            }
        }
        if (_.random(1) === 0) {
            economyManager.gambleLoss(user, owner, gambleAmount);
            return `You lost ${gambleAmount} ${currencyName}`;
        }
        economyManager.gambleWin(user, owner, gambleAmount);
        return `You won ${gambleAmount} ${currencyName}`;
    }
    if (command === 'give' && mod) {
        const [receiver, amount] = commandParts;
        economyManager.addCurrency(
            await getOrCreateUserName(receiver),
            userManager.getUser(channelName).userId,
            Number(amount),
        );
        return `gave ${receiver} ${amount} ${currencyName}`;
    }
    if (command === 'net') {
        let target: string;
        if (commandParts.length > 0) {
            [target] = commandParts;
        } else {
            target = sender;
        }
        const net = economyManager.getGambleNet(await getOrCreateUserName(target), owner);
        return `${target} has net ${net} ${currencyName} from gambling${net < 0 ? '...f' : '...congrats'}`;
    }
    return '';
};

export const handleFlagCommand: HandlerDelegate = async (
    commandParts: string[],
): Promise<string> => {
    if (commandParts[1] === 'event') {
        try {
            const event = flagToEvent(commandParts[2], commandParts.slice(3).join(' '));
            if (event.length === 0) {
                return 'flag does not exist on the specified map';
            }
            return event;
        } catch (e) {
            return 'invalid map or flag specified';
        }
    } else if (commandParts[1] === 'bit') {
        try {
            const info = getBiTInfo(commandParts[2]);
            if (info.length === 0) {
                return 'flag is not reachable in BiT';
            }
            let response = '';
            _.forEach(info, (infoString: string) => {
                response += ` ${infoString}`;
            });
            return response;
        } catch (e) {
            return 'invalid flag specified';
        }
    } else if (commandParts[1] === 'lookup') {
        try {
            const results = lookupFlag(commandParts[2], commandParts.slice(3).join(' '), true);
            if (results.length === 0) {
                return 'flag is not reachable in BiT';
            }
            let response = '';
            _.forEach(results, (result: string) => {
                response += ` ${result}`;
            });
            return response;
        } catch (e) {
            return 'invalid map specified';
        }
    }
    return 'invalid subcommand';
};

export default {};

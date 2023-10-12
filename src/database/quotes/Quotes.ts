import { db } from '../../System';
import { getTodaysDate } from '../../util/GlobalUtils';
import { handleRequest } from './Aliases';

export type Quote = {
    id: number;
    quote: string;
    alias: string;
    quotedBy: string;
    quotedOn: string;
};

export type QuoteInfo = {
    id: number;
    alias: string;
    quotedBy: string;
    quotedOn: string;
};

export type QuoteError = {
    error: string;
};

const convertFields = (quote: Quote) => {
    if (quote.alias === null) {
        quote.alias = 'unknown';
    }
    if (quote.quotedBy === null) {
        quote.quotedBy = 'unknown';
    }
    if (quote.quotedOn === null) {
        quote.quotedOn = 'unknown';
    }
};

/**
 * Retrieves a specified quote from the database
 *
 * @param {Number} quoteNumber the number of the quote to find
 * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
 */
export const getQuote = (quoteNumber: number): Quote | undefined => {
    const quote = db
        .prepare('select * from quotes where id=?')
        .get(quoteNumber);
    if (quote === undefined) {
        // there is no quote with the given id
        // return 'that quote doesn\'t exist';
        return undefined;
    }
    convertFields(quote);
    // return `#${quote.id}: ${quote.quote}`;
    return quote;
};

/**
 * Retrieves a specified quote from the database by its alias
 *
 * @param {String} alias the alias of the quote to find
 * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
 */
export const getQuoteAlias = (alias: string): Quote | undefined => {
    const quote = db.prepare('select * from quotes where alias=?').get(alias);
    if (quote === undefined) {
        // no quote with alias exists
        // return 'no quote with that alias exists';
        return undefined;
    }
    convertFields(quote);
    // return `#${quote.id} (${quote.alias}): ${quote.quote}`;
    return quote;
};

/**
 * Retrieves a random quote from the database
 *
 * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
 */
export const getRandomQuote = (): Quote | undefined => {
    const quote: Quote = db
        .prepare('select * from quotes order by random() limit 1')
        .get();
    if (!quote) {
        return undefined;
    }
    convertFields(quote);
    return quote;
};

export const addQuote = (quote: string, quotedBy: string): number => {
    const addData = db
        .prepare(
            'insert into quotes (quote, quotedBy, quotedOn) values (?, ?, ?)',
        )
        .run(quote, quotedBy, getTodaysDate());
    return addData.lastInsertRowid as number;
};

export const editQuote = (quoteNumber: number, newQuote: string) => {
    db.prepare('update quotes set quote=? where id=?').run(
        newQuote,
        quoteNumber,
    );
};

export const deleteQuote = (quoteNumber: number) => {
    if (Number.isNaN(quoteNumber)) {
        return false;
    }
    db.prepare('delete from quotes where id=?').run(quoteNumber);
    return true;
};

/**
 * Retreives the supporting info for a given quote
 *
 * @param {Number} quoteNumber the number (id) of the quote to retrieve the info for
 */
export const getQuoteInfo = (quoteNumber: number): QuoteInfo | undefined => {
    const quote = db
        .prepare('select id, alias, quotedOn, quotedBy from quotes where id=?')
        .get(quoteNumber);
    convertFields(quote);
    return quote;
};

export const editQuoteInfo = (
    quoteNumber: number,
    quotedOn: string,
    quotedBy: string,
) => {
    db.prepare('update quotes set quotedOn=?, quotedBy=? where id=?').run(
        quotedOn,
        quotedBy,
        quoteNumber,
    );
};

/**
 * Searches for all quotes where a specified string appears
 *
 * @param {String} searchString The string to search for within the quote
 */
export const searchQuote = (searchString: string): Quote[] | QuoteError => {
    if (searchString === '') {
        return {
            error: 'no search string specified',
        };
    }
    const quotes: Quote[] = [];
    db.prepare('select * from quotes')
        .all()
        .filter((quote: Quote) => quote.quote.includes(searchString))
        .forEach((quote: Quote) => {
            convertFields(quote);
            quotes.push(quote);
        });
    return quotes;
};

export const getLatestQuote = (): Quote | undefined =>
    db.prepare('select * from quotes order by id desc limit 1').get();

export const handleAliasRequest = (messageParts: string[], mod: boolean) => {
    const aliasCommand = messageParts[1];
    const quoteNumber = parseInt(messageParts[2], 10);
    const alias = messageParts.slice(3).join(' ');
    return handleRequest(aliasCommand, quoteNumber, alias, mod);
};

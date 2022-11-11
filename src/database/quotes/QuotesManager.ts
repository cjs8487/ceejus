import { Database } from 'better-sqlite3';
import { GlobalUtils } from '../../util/GlobalUtils';
import Aliaser from './Aliaser';

export type Quote = {
    id: number,
    quote: string,
    alias: string,
    quotedBy: string,
    quotedOn: string,
}

export type QuoteInfo = {
    id: number,
    alias: string,
    quotedBy: string,
    quotedOn: string,
}

export type QuoteError = {
    error: string
}

/**
 * The shared quotes module across all platforms the bot operates on. All platform bots interact with this module to
 * perform operations on the quotes subsystem.
 */
class QuotesManager {
    db: Database;
    aliaser: Aliaser;

    constructor(db: Database) {
        this.db = db;
        this.aliaser = new Aliaser(db);
    }

    /**
     * Retrieves a specified quote from the database
     *
     * @param {Number} quoteNumber the number of the quote to find
     * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
     */
    getQuote(quoteNumber: number) {
        const quote = this.db.prepare('select * from quotes where id=?').get(quoteNumber);
        if (quote === undefined) { // there is no quote with the given id
            // return 'that quote doesn\'t exist';
            return undefined;
        }
        this.convertFields(quote);
        // return `#${quote.id}: ${quote.quote}`;
        return quote;
    }

    /**
     * Retrieves a specified quote from the database by its alias
     *
     * @param {String} alias the alias of the quote to find
     * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
     */
    getQuoteAlias(alias: string) {
        const quote = this.db.prepare('select * from quotes where alias=?').get(alias);
        if (quote === undefined) { // no quote with this alias exists
            // return 'no quote with that alias exists';
            return undefined;
        }
        this.convertFields(quote);
        // return `#${quote.id} (${quote.alias}): ${quote.quote}`;
        return quote;
    }

    /**
     * Retrieves a random quote from the database
     *
     * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
     */
    getRandomQuote(): Quote {
        const quote: Quote = this.db.prepare('select * from quotes order by random() limit 1').get();
        this.convertFields(quote);
        return quote;
    }

    // eslint-disable-next-line class-methods-use-this
    convertFields(quote: Quote) {
        if (quote.alias === null) {
            quote.alias = 'unknown';
        }
        if (quote.quotedBy === null) {
            quote.quotedBy = 'unknown';
        }
        if (quote.quotedOn === null) {
            quote.quotedOn = 'unknown';
        }
    }

    addQuote(quote: string, quotedBy: string): number {
        const addData = this.db.prepare('insert into quotes (quote, quotedBy, quotedOn) values (?, ?, ?)')
            .run(quote, quotedBy, GlobalUtils.getTodaysDate());
        return addData.lastInsertRowid as number;
    }

    editQuote(quoteNumber: number, newQuote: string) {
        this.db.prepare('update quotes set quote=? where id=?').run(newQuote, quoteNumber);
    }

    deleteQuote(quoteNumber: number) {
        if (Number.isNaN(quoteNumber)) {
            return false;
        }
        this.db.prepare('delete from quotes where id=?').run(quoteNumber);
        return true;
    }

    /**
     * Retreives the supporting info for a given quote
     *
     * @param {Number} quoteNumber the number (id) of the quote to retrieve the info for
     */
    getQuoteInfo(quoteNumber: number): QuoteInfo | undefined {
        const quote = this.db.prepare('select id, alias, quotedOn, quotedBy from quotes where id=?').get(quoteNumber);
        this.convertFields(quote);
        return quote;
    }

    editQuoteInfo(quoteNumber: number, quotedOn: string, quotedBy: string) {
        this.db.prepare('update quotes set quotedOn=?, quotedBy=? where id=?').run(quotedOn, quotedBy, quoteNumber);
    }

    /**
     * Searches for all quotes where a specified string appears
     *
     * @param {String} searchString The string to search for within the quote
     */
    searchQuote(searchString: string): Quote[] | QuoteError {
        if (searchString === '') {
            return {
                error: 'no search string specified',
            };
        }
        const quotes: Quote[] = [];
        this.db.prepare('select * from quotes').all().forEach((quote: Quote) => {
            this.convertFields(quote);
            quotes.push(quote);
        });
        return quotes;
    }

    getLatestQuote(): Quote {
        return this.db.prepare('select * from quotes order by id desc limit 1').get();
    }

    handleAliasRequest(messageParts: string[], mod: boolean) {
        const aliasCommand = messageParts[1];
        const quoteNumber = parseInt(messageParts[2], 10);
        const alias = messageParts.slice(3).join(' ');
        return this.aliaser.handleRequest(aliasCommand, quoteNumber, alias, mod);
    }
}

export default QuotesManager;

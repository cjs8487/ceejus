import { Database } from 'better-sqlite3';
import { GlobalUtils } from '../../util/GlobalUtils';
import { Aliaser } from './Aliaser';

export type Quote = {
    id: number,
    quote: string,
    alias: string,
    quotedBy: string,
    quotedOn: string,
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
    getRandomQuote() {
        const quote = this.db.prepare('select * from quotes order by random() limit 1').get();
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
     * @returns A string with the info
     */
    getQuoteInfo(quoteNumber: number) {
        const quote = this.db.prepare('select * from quotes where id=?').get(quoteNumber);
        if (quote === undefined) {
            return 'no quote found';
        }
        return `info for #${quote.id}: Quoted on ${quote.quotedOn} by ${quote.quotedBy}. This quote is also known as ` +
            `"${quote.alias}"`;
    }

    editQuoteInfo(quoteNumber: number, quotedOn: string, quotedBy: string) {
        this.db.prepare('update quotes set quotedOn=?, quotedBy=? where id=?').run(quotedOn, quotedBy, quoteNumber);
    }

    /**
     * Searches for all quotes where a specified string appears
     *
     * @param {String} searchString The string to search for within the quote
     * @returns A string listing all of the quotes containing the search string
     */
    searchQuote(searchString: string) {
        let returnString = '';
        if (searchString === '') {
            return 'no search string specified';
        }
        this.db.prepare('select * from quotes').all().forEach((quote) => {
            if (quote.quote.toLowerCase().includes(searchString.toLowerCase())) {
                returnString += `#${quote.id}, `;
            }
        });
        if (returnString === '') {
            return 'no quotes found';
        }
        returnString = returnString.slice(0, returnString.length - 2);
        return returnString;
    }

    getLatestQuote() {
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
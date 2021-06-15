const { GlobalUtils } = require('../../util/GlobalUtils');
const { Aliaser } = require('./Aliaser');

/**
 * The shared quotes module across all platforms the bot operates on. All platform bots interact with this module to
 * perform operations on the quotes subsystem.
 */
class QuotesCore {
    /**
     * Creates a new bot operating on the database
     * @param {*} db The database to operate on
     */
    initialize(db) {
        this.db = db;
        this.aliaser = new Aliaser(db);
        QuotesCore.INSTANCE = this;
    }

    /**
     * Retrieves a specified quote from the database
     *
     * @param {Number} quoteNumber the number of the quote to find
     * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
     */
    getQuote(quoteNumber) {
        const quote = this.db.prepare('select * from quotes where id=?').get(quoteNumber);
        if (quote === undefined) { // there is no quote with the given id
            // return 'that quote doesn\'t exist';
            return undefined;
        }
        // return `#${quote.id}: ${quote.quote}`;
        return quote;
    }

    /**
     * Retrieves a specified quote from the database by its alias
     *
     * @param {String} alias the alias of the quote to find
     * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
     */
    getQuoteAlias(alias) {
        const quote = this.db.prepare('select * from quotes where alias=?').get(alias);
        if (quote === undefined) { // no quote with this alias exists
            // return 'no quote with that alias exists';
            return undefined;
        }
        // return `#${quote.id} (${quote.alias}): ${quote.quote}`;
        return quote;
    }

    /**
     * Retrieves a random quote from the database
     *
     * @returns The quote object for the retrieved quote, or undefined if it doesn't exist
     */
    getRandomQuote() {
        return this.db.prepare('select * from quotes order by random() limit 1').get();
    }

    addQuote(quote, quotedBy) {
        const addData = this.db.prepare('insert into quotes (quote, quotedBy, quotedOn) values (?, ?, ?)')
            .run(quote, quotedBy, GlobalUtils.getTodaysDate());
        return addData.lastInsertRowid;
    }

    editQuote(quoteNumber, newQuote) {
        this.db.prepare('update quotes set quote=? where id=?').run(newQuote, quoteNumber);
    }

    deleteQuote(quoteNumber) {
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
    getQuoteInfo(quoteNumber) {
        const quote = this.db.prepare('select * from quotes where id=?').get(quoteNumber);
        if (quote === undefined) {
            return 'no quote found';
        }
        return `info for #${quote.id}: Quoted on ${quote.quotedOn} by ${quote.quotedBy}. This quote is also known as ` +
            `"${quote.alias}"`;
    }

    editQuoteInfo(quoteNumber, quotedOn, quotedBy) {
        this.db.prepare('update quotes set quotedOn=?, quotedBy=? where id=?').run(quotedOn, quotedBy, quoteNumber);
    }

    /**
     * Searches for all quotes where a specified string appears
     *
     * @param {String} searchString The string to search for within the quote
     * @returns A string listing all of the quotes containing the search string
     */
    searchQuote(searchString) {
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

    static getInstance() {
        return QuotesCore.INSTANCE;
    }

    handleAliasRequest(messageParts, mod) {
        const aliasCommand = messageParts[1];
        const quoteNumber = parseInt(messageParts[2], 10);
        const alias = messageParts.slice(3).join(' ');
        return this.aliaser.handleRequest(aliasCommand, quoteNumber, alias, mod);
    }
}

module.exports.QuotesCore = QuotesCore;

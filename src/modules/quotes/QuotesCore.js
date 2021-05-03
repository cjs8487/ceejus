const { GlobalUtils } = require('../../util/GlobalUtils');
const { BotModule } = require('../BotModule');
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
     * Handles an incoming message
     * @param {*} messageParts An array containing the message split in ' ', excluding the command prefix and base
     * command string
     * @param {*} mod true if the executing user has permission to perform commands requiring elevated permissions
     * (update, delete, etc.). This is platform dependent
     * @returns The response to the request. Usually this is the response each platform's bot will use, but each
     * platform can modify it as seen fit (i.e. to ping the requestor)
     */
    handleCommand(messageParts, sender, mod) {
        const quoteCommand = messageParts[0];

        if (quoteCommand === 'add') {
            const quote = messageParts.slice(1).join(' ');
            const addData = this.db.prepare('insert into quotes (quote, quotedBy, quotedOn) values (?, ?, ?)')
                .run(quote, sender, GlobalUtils.getTodaysDate());
            return ` successfully added quote #${addData.lastInsertRowid}`;
        }
        if (quoteCommand === 'delete') {
            if (!mod) return '';
            if (messageParts.length < 2) {
                return `incorrect syntax: missing quote number to delete.
                    Correct syntax is !quote delete [quoteNumber]`;
            }
            const quoteNumber = parseInt(messageParts[1], 10);
            if (Number.isNaN(quoteNumber)) {
                return `${messageParts[1]} is not a number`;
            }
            this.db.prepare('delete from quotes where id=?').run(quoteNumber);
            return `#${quoteNumber} deleted`;
        }
        if (quoteCommand === 'edit') {
            if (!mod) return '';
            const quoteNumber = parseInt(messageParts[1], 10);
            const newQuote = messageParts.slice(2).join(' ');
            this.db.prepare('update quotes set quote=? where id=?').run(newQuote, quoteNumber);
            return `#${quoteNumber} edited`;
        }
        if (quoteCommand === 'alias') {
            const aliasCommand = messageParts[1];
            const quoteNumber = parseInt(messageParts[2], 10);
            const alias = messageParts.slice(3).join(' ');
            return this.aliaser.handleRequest(aliasCommand, quoteNumber, alias, mod);
        }
        if (quoteCommand === 'info') {
            const quoteNumber = parseInt(messageParts[1], 10);
            return this.getQuoteInfo(quoteNumber);
        }
        if (quoteCommand === 'search') {
            const searchString = messageParts.slice(1).join(' ');
            return this.searchQuote(searchString);
        }
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

    /**
     * Searches for all quotes where a specified string appears
     *
     * @param {String} searchString The string to search for within the quote
     * @returns A string listing all of the quotes containing the search string
     */
    searchQuote(searchString) {
        let returnString = '';
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

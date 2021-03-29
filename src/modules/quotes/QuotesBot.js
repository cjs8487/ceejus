const { Aliaser } = require('./Aliaser');

/**
 * The shared quotes module across all platforms the bot operates on. All platform bots interact with this module to
 * perform operations on the quotes subsystem.
 */
class QuotesBot {
    /**
     * Creates a new bot operating on the database
     * @param {*} db The database to operate on
     */
    constructor(db) {
        this.db = db;
        this.aliaser = new Aliaser(db);
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
    handleMessage(messageParts, mod) {
        const quoteCommand = messageParts[0];

        if (quoteCommand === 'add') {
            const quote = messageParts.slice(1).join(' ');
            const addData = this.db.prepare('insert into quotes (quote) values (?)').run(quote);
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
        // command is requesting a quote
        console.log(messageParts);
        if (messageParts.length > 0) { // more was specified in the command, so we need to fetch a specific quote
            const quoteLookup = messageParts[0];
            const quoteId = parseInt(quoteLookup, 10);
            if (Number.isNaN(quoteId)) {
                const alias = messageParts.join(' ');
                const quote = this.db.prepare('select * from quotes where alias=?').get(alias);
                if (quote === undefined) {
                    return 'no quote with that alias exists';
                }
                return `#${quote.id} (${quote.alias}): ${quote.quote}`;
            }
            const quote = this.db.prepare('select * from quotes where id=?').get(quoteId);
            if (quote === undefined) { // there are no quotes
                return 'that quote doesn\'t exist';
            }
            return `#${quote.id}: ${quote.quote}`;
        }
        // otherwise we pick a random quote from the database
        const quote = this.db.prepare('select * from quotes order by random() limit 1').get();
        if (quote === undefined) { // there are no quotes
            return 'there are no quotes! Use !quote add [quote] to add one';
        }
        return `#${quote.id}: ${quote.quote}`;
    }

    getQuoteInfo(quoteNumber) {
        const quote = this.db.prepare('select * from quotes where id=?').get(quoteNumber);
        return `info for #${quote.id}: Quoted on ${quote.quotedOn} by ${quote.quotedBy}. This quote is also known as ` +
            `"${quote.alias}"`;
    }
}

module.exports.QuotesBot = QuotesBot;

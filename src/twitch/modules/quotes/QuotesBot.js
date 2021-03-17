const TwitchHelper = require('./TwitchHelper');

const isUserMod = TwitchHelper.isUserMod;

class QuotesBot {
    constructor(client) {
        this.client = client;
    }

    handleMessage(target, context, messageParts) {
        const quoteCommand = messageParts[0];

        if (quoteCommand === 'add') {
            const quote = messageParts.slice(1).join(' ');
            const addData = this.db.prepare('insert into quotes (quote) values (?)').run(quote);
            this.client.say(
                target,
                `@${context.username} successfully added quote #${addData.lastInsertRowid}`,
            );
        } else if (quoteCommand === 'delete') {
            if (!isUserMod(context, target)) return;
            if (messageParts.length < 2) {
                this.client.say(
                    target,
                    `@${context.username} incorrect syntax: missing quote number to delete. 
                        Correct syntax is !quote delete [quoteNumber]`,
                );
                return;
            }
            const quoteNumber = parseInt(messageParts[1], 10);
            if (Number.isNaN(quoteNumber)) {
                this.client.say(
                    target,
                    `@${context.username} ${messageParts[1]} is not a number`,
                );
                return;
            }
            this.db.prepare('delete from quotes where id=?').run(quoteNumber);
            this.client.say(
                target,
                `@${context.username} #${quoteNumber} deleted`,
            );
        } else if (quoteCommand === 'edit') {
            if (!isUserMod(context, target)) return;
            const quoteNumber = parseInt(messageParts[1], 10);
            const newQuote = messageParts.slice(2).join(' ');
            this.db.prepare('update quotes set quote=? where id=?').run(newQuote, quoteNumber);
            this.client.say(
                target,
                `@${context.username} #${quoteNumber} edited`,
            );
        } else { // command is requesting a quote
            let quote;
            if (messageParts.length > 0) { // more was specified in the command, so we need to fetch a specific quote
                const quoteLookup = messageParts[0];
                const quoteId = parseInt(quoteLookup, 10);
                if (Number.isNaN(quoteId)) {
                    this.client.say(
                        target,
                        `@${context.username} aliases are not currently supported`,
                    );
                    return;
                }
                quote = this.db.prepare('select * from quotes where id=?').get(quoteId);
                if (quote === undefined) { // there are no quotes
                    this.client.say(
                        target,
                        `@${context.username} that quote doesn't exist`,
                    );
                    return;
                }
                this.client.say(
                    target,
                    `@${context.username}, #${quote.id}: ${quote.quote}`,
                );
            } else { // otherwise we pick a random quote from the database
                quote = this.db.prepare('select * from quotes order by random() limit 1').get();
                if (quote === undefined) { // there are no quotes
                    this.client.say(
                        target,
                        `@${context.username} there are no quotes PepeHands Use !quote add [quote] to add one`,
                    );
                    return;
                }
                this.client.say(
                    target,
                    `@${context.username}, #${quote.id}: ${quote.quote}`,
                );
            }
        }
    }

    setupDb(db) {
        this.db = db;
    }
}

module.exports.QuotesBot = QuotesBot;

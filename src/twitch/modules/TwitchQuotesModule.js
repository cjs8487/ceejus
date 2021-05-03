const _ = require('lodash');
const { BotModule } = require('../../modules/BotModule');
const { QuotesCore } = require('../../modules/quotes/QuotesCore');

class TwitchQuotesModule extends BotModule {
    constructor() {
        super(['quote']);
    }

    // eslint-disable-next-line class-methods-use-this
    handleCommand(commandParts, sender, mod) {
        const quoteCommand = commandParts[0];
        if (quoteCommand === 'add') {
            const quote = commandParts.slice(1).join(' ');
            const number = QuotesCore.getInstance().addQuote(quote, sender);
            return `Added quote #${number}`;
        }
        if (quoteCommand === 'delete') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            const quoteNumber = parseInt(commandParts[1], 10);
            if (!QuotesCore.getInstance().deleteQuote(quoteNumber)) {
                return `Error: ${quoteNumber} is not a number`;
            }
            return `#${quoteNumber} deleted`;
        }
        if (quoteCommand === 'edit') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            const quoteNumber = parseInt(commandParts[1], 10);
            if (Number.isNaN(quoteNumber)) {
                return `Error: ${quoteNumber} is not a number`;
            }
            const newQuote = commandParts.splice(2).join(' ');
            QuotesCore.getInstance().editQuote(quoteNumber, newQuote);
            return `#${quoteNumber} edited`;
        }
        if (quoteCommand === 'alias') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            return QuotesCore.getInstance().handleAliasRequest(commandParts, mod);
        }
        if (quoteCommand === 'info') {
            const quoteNumber = parseInt(commandParts[1], 10);
            const results = QuotesCore.getInstance().getQuoteInfo(quoteNumber);
            return results;
        }
        if (quoteCommand === 'search') {
            const searchString = commandParts.slice(1).join(' ');
            const results = QuotesCore.getInstance().searchQuote(searchString);
            return results;
        }
        // looking up a quote
        let quote;
        if (commandParts.length > 0) { // looking for a specific quote
            const lookup = commandParts[0];
            const quoteNumber = parseInt(lookup, 10);
            if (Number.isNaN(quoteNumber)) {
                const alias = commandParts.join(' ');
                quote = QuotesCore.getInstance().getQuoteAlias(alias);
                if (_.isNil(quote)) {
                    return `Quote with alias '${alias}' does not exist`;
                }
                return `#${quote.id} (${quote.alias}): ${quote.quote}`;
            }
            quote = QuotesCore.getInstance().getQuote(quoteNumber);
            if (_.isNil(quote)) {
                return `Quote #${quoteNumber} does not exist`;
            }
        } else {
            quote = QuotesCore.getInstance().getRandomQuote();
        }
        return `#${quote.id}: ${quote.quote}`;
    }
}

module.exports.TwitchQuotesModule = TwitchQuotesModule;

const express = require('express');

const quotes = express.Router();

let quotesCore = null;

quotes.use((req, res, next) => {
    if (quotesCore === null) {
        quotesCore = req.app.get('quotesCore');
    }
    next();
});

quotes.get('/quote', async (req, res) => {
    const { quoteNumber, alias} = req.query;
    let quote;
    if (quoteNumber) {
        quote = quotesCore.getQuote(quoteNumber);
    } else if (alias) {
        quote = quotesCore.getQuoteAlias(alias);
    } else {
        quote = quotesCore.getRandomQuote();
    }
    res.send(quote);
});

module.exports = quotes;

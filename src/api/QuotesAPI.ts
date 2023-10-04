import express from 'express';
import {
    getQuote,
    getQuoteAlias,
    getRandomQuote,
} from '../database/quotes/Quotes';

const quotes = express.Router();

quotes.get('/quote', (req, res) => {
    const { quoteNumber, alias } = req.query;
    let quote;
    if (quoteNumber) {
        const num = Number(quoteNumber);
        if (Number.isNaN(num)) {
            res.status(400);
            res.send('invalid number specified');
        }
        quote = getQuote(num);
    } else if (alias) {
        quote = getQuoteAlias(alias as string);
    } else {
        quote = getRandomQuote();
    }
    res.send(quote);
});

export default quotes;

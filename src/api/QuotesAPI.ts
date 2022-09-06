import express from 'express';
import { quotesManager } from '../System';

const quotes = express.Router();

quotes.get('/quote', (req, res) => {
    const { quoteNumber, alias } = req.query;
    let quote;
    if (quoteNumber) {
        const num = Number(quoteNumber);
        if (Number.isNaN(num)) {
            res.status(400);
            res.send('invalid number specfied');
        }
        quote = quotesManager.getQuote(num);
    } else if (alias) {
        quote = quotesManager.getQuoteAlias(alias as string);
    } else {
        quote = quotesManager.getRandomQuote();
    }
    res.send(quote);
});

export default quotes;

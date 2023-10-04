/**
 * Handles the Alias subsystem of the quotes bot. Specific quotes can be assigned aliases, which can then be used in
 * place of their quote number to retrieve them
 */

import { db } from '../../System';

/**
 * Updates the alias for a quote. This can change an alias or create a new one
 * @param {*} quoteNumber The quote number whose alias is being changed
 * @param {*} alias The alias we are setting
 * @returns The output string
 */
export const updateAlias = (quoteNumber: number, alias: string) => {
    db.prepare('update quotes set alias=? where id=?').run(alias, quoteNumber);
    return `#${quoteNumber} aliased to ${alias}`;
};

/**
 * Removes the alias for a quote
 * @param {*} quoteNumber The quote number whose alias we are removing
 * @returns The output string
 */
export const removeAlias = (quoteNumber: number) => {
    db.prepare('update quotes set alias=null where id=?').run(quoteNumber);
    return `removed alias for #${quoteNumber}`;
};

/**
 * Handles an alias request. The main QuoteBot should parse the command itself, and pass the parsed parts to the
 * controller
 * @param {*} requestType The type of request for the alias controller
 * @param {*} quoteNumber The number of the quote to handle
 * @param {*} alias The alias we are using
 * @param {*} mod Whether or not the command has mod level permissions
 * @returns The output string
 */
export const handleRequest = (
    requestType: string,
    quoteNumber: number,
    alias: string,
    mod: boolean,
) => {
    if (!mod) return '';
    if (requestType === 'set') {
        return updateAlias(quoteNumber, alias);
    }
    return '';
};

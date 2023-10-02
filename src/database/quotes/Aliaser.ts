import { Database } from 'better-sqlite3';

/**
 * Handles the Alias subsystem of the quotes bot. Specifc quotes can be assigned aliases, which can then be used in
 * place of their quote number to retreive them
 */
class Aliaser {
    db: Database;
    /**
     * Creates a new instance of the alias controller operating on the quote database
     * @param {*} db The database the controller is operating on
     */
    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Handles an alias request. The main QuoteBot should parse the command itself, and pass the parsed parts to the
     * controller
     * @param {*} requestType The type of request for the alias controller
     * @param {*} quoteNumber The number of the quote to handle
     * @param {*} alias The alias we are using
     * @param {*} mod Whether or not the command has mod level permissions
     * @returns The output string
     */
    handleRequest(
        requestType: string,
        quoteNumber: number,
        alias: string,
        mod: boolean,
    ) {
        if (!mod) return '';
        if (requestType === 'set') {
            return this.updateAlias(quoteNumber, alias);
        }
        return '';
    }

    /**
     * Updates the alias for a quote. This can change an alias or create a new one
     * @param {*} quoteNumber The quote number whose alias is being changed
     * @param {*} alias The alias we are setting
     * @returns The output string
     */
    updateAlias(quoteNumber: number, alias: string) {
        this.db
            .prepare('update quotes set alias=? where id=?')
            .run(alias, quoteNumber);
        return `#${quoteNumber} aliased to ${alias}`;
    }

    /**
     * Removes the alias for a quote
     * @param {*} quoteNumber The quote number whose alias we are removing
     * @returns The output string
     */
    removeAlias(quoteNumber: number) {
        this.db
            .prepare('update quotes set alias=null where id=?')
            .run(quoteNumber);
        return `removed alias for #${quoteNumber}`;
    }
}

export default Aliaser;

class Aliaser {
    constructor(db) {
        this.db = db;
    }

    handleRequest(requestType, quoteNumber, alias, mod) {
        if (!mod) return '';
        if (requestType === 'set') {
            return this.updateAlias(quoteNumber, alias);
        }
        return '';
    }

    updateAlias(quoteNumber, alias) {
        this.db.prepare('update quotes set alias=? where id=?').run(alias, quoteNumber);
        return `#${quoteNumber} aliased to ${alias}`;
    }

    removeAlias(quoteNumber) {
        this.db.prepare('update quotes set alias=null where id=?').run(quoteNumber);
        return `removed alias for #${quoteNumber}`;
    }
}

module.exports.Aliaser = Aliaser;

import { Database } from 'better-sqlite3';

class EconomyManager {
    db: Database

    constructor(db: Database) {
        this.db = db;
    }

    safeties(user: number, owner: number): void {
        if (!this.checkExists(user, owner)) {
            this.createUser(user, owner);
        }
    }

    numberSafeties(user: number, owner: number, amount: number): boolean | string {
        this.safeties(user, owner);
        if (amount < 0) {
            return 'cannot use negative numbers as paramters';
        }
        return true;
    }

    checkExists(user: number, owner: number) : boolean {
        const amount = this.db.prepare('select amount from economy where user=? and owner=?').get(user, owner);
        if (amount === undefined) {
            return false;
        }
        return true;
    }

    createUser(user: number, owner: number) {
        this.db.prepare(
            'insert into economy (user, owner, amount, gamble_net, amount_given, amount_received)' +
            ' values (?, ?, 0, 0, 0, 0)',
        ).run(user, owner);
    }

    getCurrency(user: number, owner: number): number {
        this.safeties(user, owner);
        const data = this.db.prepare('select amount from economy where user=?').get(user);
        return data.amount;
    }

    addCurrency(user: number, owner: number, amount: number): string {
        const safetyCheck = this.numberSafeties(user, owner, amount);
        if (typeof safetyCheck === 'string') {
            return safetyCheck;
        }
        if (!safetyCheck) {
            return 'Unspecified saftey failure';
        }
        const currentAmount = this.getCurrency(user, owner);
        const newAmount = currentAmount + amount;
        this.safeties(user, owner);
        this.db.prepare('update economy set amount=? where user=?').run(newAmount, user);
        return '';
    }

    removeCurrency(user: number, owner: number, amount: number): string {
        const safetyCheck = this.numberSafeties(user, owner, amount);
        if (typeof safetyCheck === 'string') {
            return safetyCheck;
        }
        if (!safetyCheck) {
            return 'Unspecified saftey failure';
        }
        const currentAmount = this.getCurrency(user, owner);
        let newAmount = currentAmount - amount;
        if (newAmount < 0) {
            newAmount = 0;
        }
        this.db.prepare('update economy set amount=? where user=?').run(newAmount, user);
        return '';
    }

    getGambleNet(user: number, owner: number): number {
        return this.db.prepare('select gamble_net from economy where user=? and owner=?').get(user, owner).gamble_net;
    }

    gambleLoss(user: number, owner: number, amount: number): void {
        this.removeCurrency(user, owner, amount);
        const currNet = this.getGambleNet(user, owner);
        const newNet = currNet - amount;
        this.db.prepare('update economy set gamble_net=? where user=? and owner=?').run(newNet, user, owner);
    }

    gambleWin(user: number, owner: number, amount: number): void {
        this.addCurrency(user, owner, amount);
        const currNet = this.getGambleNet(user, owner);
        const newNet = currNet + amount;
        this.db.prepare('update economy set gamble_net=? where user=? and owner=?').run(newNet, user, owner);
    }
}

export default EconomyManager;

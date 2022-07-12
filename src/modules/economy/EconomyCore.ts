import { Database } from 'better-sqlite3';

class EconomyCore {
    db: Database

    constructor(db: Database) {
        this.db = db;
    }

    safeties(user: string): void {
        if (!this.checkExists(user)) {
            this.createUser(user);
        }
    }

    numberSafeties(user: string, amount: number): boolean | string {
        this.safeties(user);
        if (amount < 0) {
            return 'cannot use negative numbers as paramters';
        }
        return true;
    }

    checkExists(user: string) : boolean {
        const amount = this.db.prepare('select amount from economy where user=?').get(user);
        if (amount === undefined) {
            return false;
        }
        return true;
    }

    createUser(user: string) {
        this.db.prepare('insert into economy (user, amount) values (?, 0)').run(user);
    }

    getCurrency(user: string): number {
        this.safeties(user);
        const data = this.db.prepare('select amount from economy where user=?').get(user);
        return data.amount;
    }

    addCurrency(user: string, amount: number): string {
        const safetyCheck = this.numberSafeties(user, amount);
        if (typeof safetyCheck === 'string') {
            return safetyCheck;
        }
        if (!safetyCheck) {
            return 'Unspecified saftey failure';
        }
        const currentAmount = this.getCurrency(user);
        const newAmount = currentAmount - amount;
        this.safeties(user);
        this.db.prepare('update economy set amount=? where user=?').run(newAmount, user);
        return '';
    }

    removeCurrency(user: string, amount: number): string {
        const safetyCheck = this.numberSafeties(user, amount);
        if (typeof safetyCheck === 'string') {
            return safetyCheck;
        }
        if (!safetyCheck) {
            return 'Unspecified saftey failure';
        }
        const currentAmount = this.getCurrency(user);
        let newAmount = currentAmount - amount;
        if (newAmount < 0) {
            newAmount = 0;
        }
        this.db.prepare('update economy set amount=? where user=?').run(newAmount, user);
        return '';
    }
}

export default EconomyCore;

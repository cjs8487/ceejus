import { db } from '../System';

const checkExists = (user: number, owner: number): boolean => {
    const amount = db
        .prepare('select amount from economy where user=? and owner=?')
        .get(user, owner);
    if (amount === undefined) {
        return false;
    }
    return true;
};

const createUser = (user: number, owner: number) => {
    db.prepare(
        'insert into economy (user, owner, amount, gamble_net, amount_given, amount_received)' +
            ' values (?, ?, 0, 0, 0, 0)',
    ).run(user, owner);
};

const safeties = (user: number, owner: number): void => {
    if (!checkExists(user, owner)) {
        createUser(user, owner);
    }
};

const numberSafeties = (
    user: number,
    owner: number,
    amount: number,
): boolean | string => {
    safeties(user, owner);
    if (amount < 0) {
        return 'cannot use negative numbers as paramters';
    }
    return true;
};

export const getCurrency = (user: number, owner: number): number => {
    safeties(user, owner);
    const data = db
        .prepare('select amount from economy where user=? and owner=?')
        .get(user, owner);
    return data.amount;
};

export const addCurrency = (
    user: number,
    owner: number,
    amount: number,
): string => {
    const safetyCheck = numberSafeties(user, owner, amount);
    if (typeof safetyCheck === 'string') {
        return safetyCheck;
    }
    if (!safetyCheck) {
        return 'Unspecified saftey failure';
    }
    const currentAmount = getCurrency(user, owner);
    const newAmount = currentAmount + amount;
    safeties(user, owner);
    db.prepare('update economy set amount=? where user=?').run(newAmount, user);
    return '';
};

export const removeCurrency = (
    user: number,
    owner: number,
    amount: number,
): string => {
    const safetyCheck = numberSafeties(user, owner, amount);
    if (typeof safetyCheck === 'string') {
        return safetyCheck;
    }
    if (!safetyCheck) {
        return 'Unspecified saftey failure';
    }
    const currentAmount = getCurrency(user, owner);
    let newAmount = currentAmount - amount;
    if (newAmount < 0) {
        newAmount = 0;
    }
    db.prepare('update economy set amount=? where user=?').run(newAmount, user);
    return '';
};

export const getGambleNet = (user: number, owner: number): number =>
    db
        .prepare('select gamble_net from economy where user=? and owner=?')
        .get(user, owner).gamble_net;

export const gambleLoss = (
    user: number,
    owner: number,
    amount: number,
): void => {
    if (removeCurrency(user, owner, amount) !== '') {
        return;
    }
    const currNet = getGambleNet(user, owner);
    const newNet = currNet - amount;
    db.prepare('update economy set gamble_net=? where user=? and owner=?').run(
        newNet,
        user,
        owner,
    );
};

export const gambleWin = (
    user: number,
    owner: number,
    amount: number,
): void => {
    if (addCurrency(user, owner, amount) !== '') {
        return;
    }
    const currNet = getGambleNet(user, owner);
    const newNet = currNet + amount;
    db.prepare('update economy set gamble_net=? where user=? and owner=?').run(
        newNet,
        user,
        owner,
    );
};

export const getGiven = (user: number, owner: number): number => {
    safeties(user, owner);
    const data = db
        .prepare('select amount_given from economy where user=? and owner=?')
        .get(user, owner);
    return data.amount_given;
};

export const currencyGiven = (user: number, owner: number, amount: number) => {
    safeties(user, owner);
    const curr = getGiven(user, owner);
    db.prepare(
        'update economy set amount_given=? where user=? and owner=?',
    ).run(curr + amount, user, owner);
};

export const getReceived = (user: number, owner: number): number => {
    safeties(user, owner);
    const data = db
        .prepare('select amount_received from economy where user=? and owner=?')
        .get(user, owner);
    return data.amount_received;
};

export const currencyReceived = (
    user: number,
    owner: number,
    amount: number,
) => {
    safeties(user, owner);
    const curr = getReceived(user, owner);
    db.prepare(
        'update economy set amount_received=? where user=? and owner=?',
    ).run(curr + amount, user, owner);
};

export const giveMoney = (
    user: number,
    to: number,
    owner: number,
    amount: number,
) => {
    safeties(user, owner);
    safeties(to, owner);
    if (addCurrency(to, owner, amount) !== '') {
        return;
    }
    if (removeCurrency(user, owner, amount) !== '') {
        return;
    }
    currencyGiven(user, owner, amount);
    currencyReceived(to, owner, amount);
};

import _ from 'lodash';
import {
    gambleLoss,
    gambleWin,
    getCurrency,
    getGambleNet,
    giveMoney,
} from '../../database/Economy';
import { getUserByName } from '../../database/Users';
import { HandlerDelegate } from '../../modules/Modules';
import { getOrCreateUserName } from '../../util/UserUtils';
import { getEconomyConfig } from '../../database/EconomyConfig';

const handleMoney: HandlerDelegate = async (
    commandParts,
    sender,
    mod,
    ...metadata
) => {
    const [channelName] = metadata;
    const owner = getUserByName(channelName);
    if (!owner) return 'economy is not configured';
    const economyConfig = getEconomyConfig(owner.userId);
    if (!economyConfig) return 'economy is not configured';
    const currencyName = economyConfig.currencyName;

    let target: string;
    if (commandParts.length > 0) {
        [target] = commandParts;
    } else {
        target = sender;
    }
    return `${getCurrency(
        await getOrCreateUserName(target),
        owner.userId,
    )} ${currencyName}`;
};
const handleGamble: HandlerDelegate = async (
    commandParts,
    sender,
    mod,
    ...metadata
) => {
    const [channelName] = metadata;
    const user = await getOrCreateUserName(sender);
    const owner = getUserByName(channelName);
    if (!owner) return 'economy is not configured';
    const economyConfig = getEconomyConfig(owner.userId);
    if (!economyConfig) return 'economy is not configured';
    const { currencyName, minimumGamble } = economyConfig;

    const [amount] = commandParts;
    const total = getCurrency(user, owner.userId);
    let gambleAmount: number;
    if (amount === 'all') {
        gambleAmount = total;
    } else {
        gambleAmount = Number(amount);
        if (Number.isNaN(gambleAmount)) {
            return 'You must gamble with a number or "all"';
        }
        if (gambleAmount < 0) {
            return "Can't gamble a negative amount";
        }
        if (gambleAmount > total) {
            return "Can't gamble more than you have";
        }
    }
    if (gambleAmount < minimumGamble) {
        return `Cannot gamble less than ${minimumGamble} ${currencyName}`;
    }
    if (_.random(1) === 0) {
        gambleLoss(user, owner.userId, gambleAmount);
        return `You lost ${gambleAmount} ${currencyName}`;
    }
    gambleWin(user, owner.userId, gambleAmount);
    return `You won ${gambleAmount} ${currencyName}`;
};

const handleGive: HandlerDelegate = async (
    commandParts,
    sender,
    mod,
    ...metadata
) => {
    const [channelName] = metadata;
    const owner = getUserByName(channelName);
    if (!owner) return 'economy is not configured';
    const economyConfig = getEconomyConfig(owner.userId);
    if (!economyConfig) return 'economy is not configured';
    const currencyName = economyConfig.currencyName;
    const user = await getOrCreateUserName(sender);
    const total = getCurrency(user, owner.userId);
    const [receiverName, amountStr] = commandParts;
    const amount = Number(amountStr);
    const receiver = await getOrCreateUserName(receiverName);
    if (Number.isNaN(amount)) {
        return `${amount} is not a number`;
    }
    if (amount <= 0) {
        return `must give away at least 1 ${currencyName}`;
    }
    if (amount > total) {
        return `cannot give away more ${currencyName} than you have`;
    }
    giveMoney(user, receiver, owner.userId, amount);
    return `gave ${receiverName} ${amount} ${currencyName}`;
};

const handleNet: HandlerDelegate = async (
    commandParts,
    sender,
    mod,
    ...metadata
) => {
    const [channelName] = metadata;
    const owner = getUserByName(channelName);
    if (!owner) return 'economy is not configured';
    const economyConfig = getEconomyConfig(owner.userId);
    if (!economyConfig) return 'economy is not configured';
    const currencyName = economyConfig.currencyName;

    let target: string;
    if (commandParts.length > 0) {
        [target] = commandParts;
    } else {
        target = sender;
    }
    const net = getGambleNet(await getOrCreateUserName(target), owner.userId);
    return `${target} has net ${net} ${currencyName} from gambling${
        net < 0 ? '...f' : '...congrats'
    }`;
};
const commandHandlers = new Map<string, HandlerDelegate>();
commandHandlers.set('money', handleMoney);
commandHandlers.set('gamble', handleGamble);
commandHandlers.set('give', handleGive);
commandHandlers.set('net', handleNet);

const economyModule = {
    name: 'Economy',
    key: 'economy',
    commandHandlers,
};

export default economyModule;

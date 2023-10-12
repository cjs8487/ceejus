import _ from 'lodash';
import {
    addCurrency,
    gambleLoss,
    gambleWin,
    getCurrency,
    getGambleNet,
} from '../../database/Economy';
import { getUserByName } from '../../database/Users';
import { HandlerDelegate } from '../../modules/Modules';
import { getOrCreateUserName } from '../../util/UserUtils';

// TODO: PULL DATA FROFM ECONOMY CONFIGURATION IN DATABASE AT COMMAND EXECUTION
const currencyName = 'BiTcoins';
const gambleMinimum = 10;

const handleMoney: HandlerDelegate = async (
    commandParts,
    sender,
    mod,
    ...metadata
) => {
    const [channelName] = metadata;
    const owner = getUserByName(channelName);
    if (!owner) return 'economy is not configured';

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
    if (gambleAmount < gambleMinimum) {
        return `Cannot gamble less than ${gambleMinimum} ${currencyName}`;
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

    const [receiver, amount] = commandParts;
    addCurrency(
        await getOrCreateUserName(receiver),
        owner.userId,
        Number(amount),
    );
    return `gave ${receiver} ${amount} ${currencyName}`;
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

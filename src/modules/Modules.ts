import _ from 'lodash';
import { getOrCreateUserName } from '../util/UserUtils';
import { economyManager, userManager } from '../System';

export type HandlerDelegate = (
    commandParts: string[],
    sender: string,
    mod: boolean,
    ...metadata: string[]
) => Promise<string>;

export const handleEconomyCommand: HandlerDelegate = async (
    commandParts: string[],
    sender: string,
    mod: boolean,
    ...metadata: string[]
): Promise<string> => {
    const command = commandParts.shift();
    const [channelName] = metadata;
    const user = await getOrCreateUserName(sender);
    const owner = userManager.getUser(channelName).userId;
    const currencyName = 'BiTcoins';
    if (command === 'money') {
        let target: string;
        if (commandParts.length > 0) {
            [target] = commandParts;
        } else {
            target = sender;
        }
        return `${economyManager.getCurrency(await getOrCreateUserName(target), owner)} ${currencyName}`;
    }
    if (command === 'gamble') {
        const [amount] = commandParts;
        const total = economyManager.getCurrency(user, owner);
        let gambleAmount: number;
        if (amount === 'all') {
            gambleAmount = total;
        } else {
            gambleAmount = Number(amount);
            if (Number.isNaN(gambleAmount)) {
                return 'You must gamble with a number or "all"';
            }
            if (gambleAmount < 0) {
                return 'Can\'t gamble a negative amount';
            }
            if (gambleAmount > total) {
                return 'Can\'t gamble more than you have';
            }
        }
        if (_.random(1) === 0) {
            economyManager.gambleLoss(user, owner, gambleAmount);
            return `You lost ${gambleAmount} ${currencyName}`;
        }
        economyManager.gambleWin(user, owner, gambleAmount);
        return `You won ${gambleAmount} ${currencyName}`;
    }
    if (command === 'give' && mod) {
        const [receiver, amount] = commandParts;
        economyManager.addCurrency(
            await getOrCreateUserName(receiver),
            userManager.getUser(channelName).userId,
            Number(amount),
        );
        return `gave ${receiver} ${amount} ${currencyName}`;
    }
    if (command === 'net') {
        let target: string;
        if (commandParts.length > 0) {
            [target] = commandParts;
        } else {
            target = sender;
        }
        const net = economyManager.getGambleNet(await getOrCreateUserName(target), owner);
        return `${target} has net ${net} ${currencyName} from gambling${net < 0 ? '...f' : '...congrats'}`;
    }
    return '';
};

export default {};

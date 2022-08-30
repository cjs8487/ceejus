import { getOrCreateUserName } from '../util/UserUtils';
import { economyManager, userManager } from '../System';
import _ from 'lodash';

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
    const currencyName = 'BiTcoins';
    if (command === 'money') {
        return `${economyManager.getCurrency(
            await getOrCreateUserName(sender),
            userManager.getUser(channelName).userId,
        )}`;
    }
    if (command === 'gamble') {
        const [amount] = commandParts;
        const user = await getOrCreateUserName(sender);
        const owner = userManager.getUser(channelName).userId;
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
            economyManager.removeCurrency(user, owner, gambleAmount);
            return `You lost ${gambleAmount} ${currencyName}`;
        }
        economyManager.addCurrency(user, owner, gambleAmount);
        return `You won ${gambleAmount} ${currencyName}`;
    }
    if (command === 'give' && mod) {
        const [receiver, amount] = commandParts;
        economyManager.addCurrency(
            await getOrCreateUserName(receiver),
            userManager.getUser(channelName).userId,
            Number(amount),
        );
        return `gave ${receiver} ${amount} units`;
    }
    return '';
};

export default {};

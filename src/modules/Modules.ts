import _ from 'lodash';
import { flagToEvent, getBiTInfo, lookupFlag } from 'ss-scene-flags';
import { economyManager, userManager } from '../System';
import { getOrCreateUserName } from '../util/UserUtils';

/**
 * Represents a function that handles a given command or subset of commands
 */
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

export const handleFlagCommand: HandlerDelegate = async (
    commandParts: string[],
): Promise<string> => {
    if (commandParts[1] === 'event') {
        try {
            const event = flagToEvent(commandParts[2], commandParts.slice(3).join(' '));
            if (event.length === 0) {
                return 'flag does not exist on the specified map';
            }
            return event;
        } catch (e) {
            return 'invalid map or flag specified';
        }
    } else if (commandParts[1] === 'bit') {
        try {
            const info = getBiTInfo(commandParts[2]);
            if (info.length === 0) {
                return 'flag is not reachable in BiT';
            }
            let response = '';
            _.forEach(info, (infoString: string) => {
                response += ` ${infoString}`;
            });
            return response;
        } catch (e) {
            return 'invalid flag specified';
        }
    } else if (commandParts[1] === 'lookup') {
        try {
            const results = lookupFlag(commandParts[2], commandParts.slice(3).join(' '), true);
            if (results.length === 0) {
                return 'flag is not reachable in BiT';
            }
            let response = '';
            _.forEach(results, (result: string) => {
                response += ` ${result}`;
            });
            return response;
        } catch (e) {
            return 'invalid map specified';
        }
    }
    return 'invalid subcommand';
};

export default {};

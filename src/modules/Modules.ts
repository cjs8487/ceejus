import _ from 'lodash';
import { flagToEvent, getBiTInfo, lookupFlag } from 'ss-scene-flags';
import { Quote, QuoteInfo } from '../database/quotes/Quotes';

/**
 * Represents a function that handles a given command or subset of commands
 */
export type HandlerDelegate = (
    commandParts: string[],
    sender: string,
    mod: boolean,
    ...metadata: string[]
) => Promise<string | undefined>;

export type QuoteResultMultiple = {
    quotes: Quote[];
};

export enum SearchType {
    number,
    alias,
    search,
}

export type QuoteResultNotFound = {
    type: SearchType;
};

export type QuoteResultMessage = {
    message: string;
};

export type QuoteResultError = {
    isPermissionDenied: boolean;
    error: string;
};

export type QuoteResult =
    | Quote
    | QuoteResultMultiple
    | QuoteInfo
    | QuoteResultNotFound
    | QuoteResultMessage
    | QuoteResultError;

export const handleFlagCommand: HandlerDelegate = async (
    commandParts: string[],
): Promise<string> => {
    if (commandParts[1] === 'event') {
        try {
            const event = flagToEvent(
                commandParts[2],
                commandParts.slice(3).join(' '),
            );
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
            const results = lookupFlag(
                commandParts[2],
                commandParts.slice(3).join(' '),
                true,
            );
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

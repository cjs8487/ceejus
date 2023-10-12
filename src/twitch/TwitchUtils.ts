import { ChatUser } from '@twurple/chat';
import { HandlerDelegate } from '../modules/Modules';

/**
 * Checks if a given user is mod. Requires a message and channel context to properly make the determination
 * @param {*} user The user object who sent the message in question (this should come directly from Twitch)
 * @param {*} channel The channel the message was sent in
 */
export const isUserMod = (user: ChatUser) => user.isMod || user.isBroadcaster;

type DelegateModifer = (delegate: HandlerDelegate) => HandlerDelegate;

export const replyTo: DelegateModifer =
    (delegate: HandlerDelegate) =>
    async (commandParts, user, mod, ...metadata) => {
        const response = await delegate(commandParts, user, mod, ...metadata);
        if (!response) {
            return undefined;
        }
        return `@${user} ${response}`;
    };

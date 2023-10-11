import { ChatUser } from '@twurple/chat';

/**
 * Checks if a given user is mod. Requires a message and channel context to properly make the determination
 * @param {*} user The user object who sent the message in question (this should come directly from Twitch)
 * @param {*} channel The channel the message was sent in
 */
export const isUserMod = (user: ChatUser) => user.isMod || user.isBroadcaster;

export const replyTo = (response: string, user: string) =>
    `@${user} ${response}`;

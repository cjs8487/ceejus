/**
 * Helper methods for Twitch functionality
 */
class TwitchHelper {
    /**
     * Checks if a given user is mod. Requires a message and channel context to properly make the determination
     * @param {*} user The user object who sent the message in question (this should come directly from Twitch)
     * @param {*} channel The channel the message was sent in
     */
    static isUserMod(user, channel) {
        const mod = user.mod || user['user-type'] === 'mod';
        const me = channel.slice(1) === user.username;
        return mod || me;
    }
}

module.exports.isUserMod = TwitchHelper.isUserMod;

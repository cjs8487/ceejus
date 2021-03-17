class TwitchHelper {
    static isUserMod(user, channel) {
        const mod = user.mod || user['user-type'] === 'mod';
        const me = channel.slice(1) === user.username;
        return mod || me;
    }
}

module.exports.isUserMod = TwitchHelper.isUserMod;

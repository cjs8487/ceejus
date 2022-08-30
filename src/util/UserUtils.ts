import { botApiClient, userManager } from '../System';

export const getOrCreateUserId = async (twitchId: string): Promise<number> => {
    const user = userManager.getUserByTwitchId(twitchId).userId;
    if (user === -1) {
        const username = (await botApiClient.users.getUserById(twitchId))?.name;
        if (username === undefined) return -1;
        return userManager.registerUserWithoutAuth(username, twitchId);
    }
    return user;
};

export const getOrCreateUserName = async (username: string): Promise<number> => {
    const twitchId = (await botApiClient.users.getUserByName(username))?.id;
    if (twitchId === undefined) return -1;
    const user = userManager.getUserByTwitchId(twitchId).userId;
    if (user === -1) {
        return userManager.registerUserWithoutAuth(username, twitchId);
    }
    return user;
};

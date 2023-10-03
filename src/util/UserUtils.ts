import { apiClient } from '../auth/TwitchAuth';
import { getUserByTwitchId, registerUserWithoutAuth } from '../database/Users';

export const getOrCreateUserId = async (twitchId: string): Promise<number> => {
    const user = getUserByTwitchId(twitchId);
    if (!user) {
        const username = (await apiClient.users.getUserById(twitchId))?.name;
        if (!username) return -1;
        return registerUserWithoutAuth(username, twitchId);
    }
    return user.userId;
};

export const getOrCreateUserName = async (
    username: string,
): Promise<number> => {
    const twitchId = (await apiClient.users.getUserByName(username))?.id;
    if (twitchId === undefined) return -1;
    const user = getUserByTwitchId(twitchId);
    if (!user) {
        return registerUserWithoutAuth(username, twitchId);
    }
    return user.userId;
};

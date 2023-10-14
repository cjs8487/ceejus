import { ApiClient } from '@twurple/api';
import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';
import {
    twitchClientId,
    twitchClientSecret,
    twitchRedirect,
} from '../Environment';
import { getUserByTwitchId, updateAuth } from '../database/Users';

const authProvider = new RefreshingAuthProvider({
    clientId: twitchClientId,
    clientSecret: twitchClientSecret,
    redirectUri: twitchRedirect,
});
authProvider.onRefresh((userId, newToken) => {
    const user = getUserByTwitchId(userId);
    if (!user) return;
    updateAuth(user.userId, 'twitch', newToken.refreshToken ?? '');
});

export const apiClient = new ApiClient({ authProvider });

export const registerUserAuth = (
    token: AccessToken,
    twitchId?: string,
): void => {
    if (twitchId) {
        authProvider.addUser(twitchId, token);
    } else {
        authProvider.addUserForToken(token);
    }
};

export const getAuthToken = async (
    twitchId: string,
): Promise<AccessToken | null> => authProvider.getAccessTokenForUser(twitchId);

export const doCodeExchange = async (code: string) => {
    const twitchId = await authProvider.addUserForCode(code);
    return authProvider.getAccessTokenForUser(twitchId);
};

export const isUserRegistered = (twitchId: string) =>
    authProvider.hasUser(twitchId);

export const getAppToken = async () => authProvider.getAppAccessToken();

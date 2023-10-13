import axios from 'axios';
import {
    discordClientId,
    discordClientSecret,
    discordRedirect,
} from '../Environment';

export type DiscordToken = {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    scope: string;
};

const responseDataToTokenObject = (
    data: Record<string, string>,
): DiscordToken => ({
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: Number(data.expires_in),
    refreshToken: data.refresh_token,
    scope: data.scope,
});

export const exchangeCode = async (code: string): Promise<DiscordToken> => {
    const { data } = await axios.post(
        'https://discord.com/api/v10/oauth2/token',
        {
            client_id: discordClientId,
            client_secret: discordClientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: discordRedirect,
        },
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
        },
    );
    return responseDataToTokenObject(data);
};

export const refreshToken = async (token: string): Promise<DiscordToken> => {
    const params = new URLSearchParams();
    params.append('client_id', discordClientId);
    params.append('client_secret', discordClientSecret);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', token);
    const { data } = await axios.post(
        'https://discord.com/api/v10/oauth2/token',
        params,
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
        },
    );
    return responseDataToTokenObject(data);
};

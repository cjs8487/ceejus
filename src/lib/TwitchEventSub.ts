import { request } from 'https';
import { logError } from '../Logger';
import { getAppToken } from '../auth/TwitchAuth';
import { ngrokUrl, twitchClientId, twitchClientSecret } from '../Environment';

type WebhookTransport = {
    method: 'webhook';
    callback: string;
    secret: string;
};

type ErrorResponse = {
    error: string;
    status: number;
    message: string;
};

type CreateSubscriptionDataEntry = {
    id: string;
    status: string;
    type: string;
    version: string;
    condition: any;
    // eslint-disable-next-line camelcase
    created_at: string;
    transport: WebhookTransport;
    cost: number;
};

export type CreateSubscriptionResponse =
    | {
          data: CreateSubscriptionDataEntry[];
          total: number;
          // eslint-disable-next-line camelcase
          total_cost: number;
          // eslint-disable-next-line camelcase
          max_total_cost: number;
      }
    | ErrorResponse;

const transport = {
    method: 'webhook',
    callback: `${ngrokUrl}/notification`,
    secret: twitchClientSecret,
};

const doRequest = <T>(params: any, body: any): Promise<T> => {
    let responseData = '';
    return new Promise<T>((resolve, reject) => {
        const req = request(params, (result) => {
            result.setEncoding('utf8');
            result
                .on('data', (d) => {
                    responseData += d;
                })
                .on('end', () => {
                    resolve(JSON.parse(responseData));
                });
        });
        req.on('error', (e) => {
            logError(`Error during async request: ${e}`);
            reject(e);
        });
        req.write(JSON.stringify(body));
        req.end();
    });
};

export const subscribeToRedemptionAddEvent = async (
    broadcasterId: string,
    rewardId: string,
): Promise<CreateSubscriptionResponse> => {
    const subscriptionCreationParams = {
        host: 'api.twitch.tv',
        path: 'helix/eventsub/subscriptions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Client-ID': twitchClientId,
            Authorization: `Bearer ${(await getAppToken())?.accessToken}`,
        },
    };
    const createWebHookBody = {
        type: 'channel.channel_points_custom_reward_redemption.add',
        version: '1',
        condition: {
            broadcaster_user_id: broadcasterId,
            reward_id: rewardId,
        },
        transport,
    };
    return doRequest<CreateSubscriptionResponse>(
        subscriptionCreationParams,
        createWebHookBody,
    );
};

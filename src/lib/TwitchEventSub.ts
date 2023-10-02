import { request } from 'https';
import { AuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api/lib';
import { logError } from '../Logger';

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

export default class TwitchEventSubHandler {
    private clientId: string;
    private apiClient: ApiClient;
    private secret: string;
    private authProvider: AuthProvider;
    private transport: WebhookTransport;

    constructor(
        clientId: string,
        apiClient: ApiClient,
        secret: string,
        authProvider: AuthProvider,
        urlBase: string,
    ) {
        this.clientId = clientId;
        this.apiClient = apiClient;
        this.secret = secret;
        this.authProvider = authProvider;
        this.transport = {
            method: 'webhook',
            callback: `${urlBase}/notification`,
            secret: this.secret,
        };
    }

    public async subscribeToRedemptionAddEvent(
        broadcasterId: string,
        rewardId: string,
    ): Promise<CreateSubscriptionResponse> {
        const subscriptionCreationParams = {
            host: 'api.twitch.tv',
            path: 'helix/eventsub/subscriptions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-ID': this.clientId,
                Authorization: `Bearer ${(
                    await this.authProvider.getAccessToken()
                )?.accessToken}`,
            },
        };
        const createWebHookBody = {
            type: 'channel.channel_points_custom_reward_redemption.add',
            version: '1',
            condition: {
                broadcaster_user_id: broadcasterId,
                reward_id: rewardId,
            },
            transport: this.transport,
        };
        return this.doRequest<CreateSubscriptionResponse>(
            subscriptionCreationParams,
            createWebHookBody,
        );
    }

    // eslint-disable-next-line class-methods-use-this
    private async doRequest<T>(params: any, body: any): Promise<T> {
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
    }
}

import { request } from 'https';
import { createHmac } from 'crypto';
import { AuthProvider } from '@twurple/auth';
import { Application, Request, Response } from 'express';
import { ApiClient } from '@twurple/api/lib';

type CreateSubscriptionHeaders = {
    'Content-Type': 'application/json';
    'Client-ID': string;
    Authorization: string;
}

type CreateSubscriptionParams = {
    host: 'api.twitch.tv';
    path: 'helix/eventsub/subscriptions';
    method: 'POST';
    headers: CreateSubscriptionHeaders;
}

type WebhookTransport = {
    method: 'webhook';
    callback: string;
    secret: string;
}

type ErrorResponse = {
    error: string;
    status: number;
    message: string;
}

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

export type CreateSubscriptionResponse = {
    data: CreateSubscriptionDataEntry[];
    total: number;
    // eslint-disable-next-line camelcase
    total_cost: number;
    // eslint-disable-next-line camelcase
    max_total_cost: number;
} | ErrorResponse;

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
        authProvider:AuthProvider,
        app: Application, urlBase: string,
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
        this.notification = this.notification.bind(this);
        app.post('/notification', this.notification);
    }

    public async subscribeToRedemptionAddEvent(broadcasterId: string): Promise<CreateSubscriptionResponse> {
        const subscriptionCreationParams = {
            host: 'api.twitch.tv',
            path: 'helix/eventsub/subscriptions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-ID': this.clientId,
                Authorization: `Bearer ${(await this.authProvider.getAccessToken())?.accessToken}`,
            },
        };
        const createWebHookBody = {
            type: 'channel.channel_points_custom_reward_redemption.add',
            version: '1',
            condition: {
                broadcaster_user_id: broadcasterId,
            },
            transport: this.transport,
        };
        return this.doRequest<CreateSubscriptionResponse>(subscriptionCreationParams, createWebHookBody);
    }

    // eslint-disable-next-line class-methods-use-this
    private async doRequest<T>(params: any, body: any): Promise<T> {
        let responseData = '';
        return new Promise<T>((resolve, reject) => {
            const req = request(params, (result) => {
                result.setEncoding('utf8');
                result.on('data', (d) => {
                    responseData += d;
                }).on('end', () => {
                    resolve(JSON.parse(responseData));
                });
            });
            req.on('error', (e) => {
                console.log(`Error ${e}`);
                reject(e);
            });
            req.write(JSON.stringify(body));
            req.end();
        });
    }

    private async notification(req: any, res: Response) {
        console.log('POST to /notification');
        // safeties
        const signature = req.header('Twitch-Eventsub-Message-Signature');
        const messageId = req.header('Twitch-Eventsub-Message-Id');
        const timestamp = req.header('Twitch-Eventsub-Message-Timestamp');
        if (signature === undefined || messageId === undefined || timestamp === undefined) {
            console.log('Missing a required header element');
            res.status(403).send('Forbidden');
            return;
        }
        if (!this.verifySignature(signature, messageId, timestamp, req.rawBody)) {
            console.log('failed message signature verification');
            res.status(403).send('Forbidden');
            return;
        }
        // handle the notification
        const messageType = req.header('Twitch-Eventsub-Message-Type');
        if (messageType === 'webhook_callback_verification') {
            console.log(req.body.challenge);
            res.send(req.body.challenge);
        } else if (messageType === 'notification') {
            console.log(req.body.event);
            const { event } = req.body;
            try {
                console.log(event);
                // TODO: handle event based on type and metadata and call appropriate delegate
                // this.apiClient.channelPoints.updateRedemptionStatusByIds(
                //     event.broadcaster_user_id,
                //     event.reward.id,
                //     event.id,
                //     'FULFILLED',
                // );
            } catch (e) {
                console.log(e);
            }
            res.send('');
        }
    }

    private verifySignature(messageSignature: string, messageID: string, messageTimestamp: string, body: string) {
        const message = messageID + messageTimestamp + body;
        const signature = createHmac('sha256', this.secret).update(message);
        const expectedSignature = `sha256=${signature.digest('hex')}`;
        return expectedSignature === messageSignature;
    }
}

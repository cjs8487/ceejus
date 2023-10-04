import { createHmac } from 'crypto';
import { Request, Response } from 'express';
import { secret } from '../Environment';
import { getOrCreateUserId } from '../util/UserUtils';
import { logError, logInfo, logWarn } from '../Logger';
import { apiClient, isUserRegistered } from '../auth/TwitchAuth';
import { getRedemption } from '../database/EconomyRedemptions';
import { addCurrency } from '../database/Economy';
import { deleteMetadata, getMetadata } from '../database/Redemptions';

const verifySignature = (
    messageSignature: string,
    messageID: string,
    messageTimestamp: string,
    body: string,
) => {
    const message = messageID + messageTimestamp + body;
    const signature = createHmac('sha256', secret).update(message);
    const expectedSignature = `sha256=${signature.digest('hex')}`;
    return expectedSignature === messageSignature;
};

export const handleEconomyRedemption = async (data: any) => {
    const owner = data.broadcaster_user_id;
    if (!isUserRegistered(owner)) {
        logWarn('received a notification for a channel with no user record');
    } else {
        const { amount } = getRedemption(data.reward.id);
        const twitchId = data.user_id;
        const user = await getOrCreateUserId(twitchId);
        addCurrency(user, owner, amount);
        apiClient.asUser(owner, (ctx) =>
            ctx.channelPoints.updateRedemptionStatusByIds(
                data.broadcaster_user_id,
                data.reward.id,
                [data.id],
                'FULFILLED',
            ),
        );
    }
};

export const notification = async (req: Request, res: Response) => {
    // safeties
    const signature = req.header('Twitch-Eventsub-Message-Signature');
    const messageId = req.header('Twitch-Eventsub-Message-Id');
    const timestamp = req.header('Twitch-Eventsub-Message-Timestamp');
    if (
        signature === undefined ||
        messageId === undefined ||
        timestamp === undefined
    ) {
        logWarn('Missing a required header element');
        res.status(403).send('Forbidden');
        return;
    }
    if (!verifySignature(signature, messageId, timestamp, req.rawBody)) {
        logError('failed message signature verification');
        res.status(403).send('Forbidden');
        return;
    }
    // handle the notification
    const messageType = req.header('Twitch-Eventsub-Message-Type');
    if (messageType === 'webhook_callback_verification') {
        res.send(req.body.challenge);
    } else if (messageType === 'revocation') {
        const { id, status } = req.body;
        deleteMetadata(id);
        if (status === 'notification_failures_exceeded') {
            logError(
                `Subscription with ID ${id} revoked due to callback failures`,
            );
        } else {
            logInfo(`Subscripion with ID ${id} revoked with status ${status}`);
        }
    } else if (messageType === 'notification') {
        const { event } = req.body;
        try {
            // TODO: handle event based on type and metadata and call appropriate delegate
            const { module } = getMetadata(event.reward.id);
            switch (module) {
                case 'economy':
                    handleEconomyRedemption(event);
                    break;
                default:
                    logError(
                        'received a notification for a redemption with no associtaed handler',
                    );
            }
        } catch (e: any) {
            logError(`Error while handling an EventSub notification ${e}`);
        }
        res.send('');
    }
};

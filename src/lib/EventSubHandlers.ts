import { createHmac } from 'crypto';
import { Request, Response } from 'express';
import { economyManager, economyRedemptionsManager, redemptionsManager, tokenManager, userManager } from '../System';
import { secret } from '../Environment';

const verifySignature = (messageSignature: string, messageID: string, messageTimestamp: string, body: string) => {
    const message = messageID + messageTimestamp + body;
    const signature = createHmac('sha256', secret).update(message);
    const expectedSignature = `sha256=${signature.digest('hex')}`;
    return expectedSignature === messageSignature;
};

export const handleEconomyRedemption = (
    data: any,
) => {
    const owner = userManager.getUserByTwitchId(data.broadcaster_user_id).userId;
    console.log(owner);
    const userApiClient = tokenManager.getApiClient(owner);
    if (userApiClient === undefined) {
        console.log('received a notification for a user with no user record');
    } else {
        const { amount } = economyRedemptionsManager.getRedemption(data.reward.id);

        console.log(`Giving ${data.user_name} ${amount} currency`);
        economyManager.addCurrency(userManager.getUserByTwitchId(data.user_id).userId, owner, amount);
        userApiClient.channelPoints.updateRedemptionStatusByIds(
            data.broadcaster_user_id,
            data.reward.id,
            [data.id],
            'FULFILLED',
        );
    }
};

export const notification = async (req: any, res: Response) => {
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
    if (!verifySignature(signature, messageId, timestamp, req.rawBody)) {
        console.log('failed message signature verification');
        res.status(403).send('Forbidden');
        return;
    }
    // handle the notification
    const messageType = req.header('Twitch-Eventsub-Message-Type');
    if (messageType === 'webhook_callback_verification') {
        res.send(req.body.challenge);
    } else if (messageType === 'notification') {
        const { event } = req.body;
        try {
            console.log(event);
            // TODO: handle event based on type and metadata and call appropriate delegate
            const { module, type } = redemptionsManager.getMetadata(event.reward.id);
            console.log(`received notification for ${module} - ${type}`);
            switch (module) {
                case 'economy':
                    handleEconomyRedemption(event);
                    break;
                default:
                    console.log('received a notification for a redemption with no associtaed handler');
            }
        } catch (e) {
            console.log(e);
        }
        res.send('');
    }
};

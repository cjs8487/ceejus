import { ApiClient } from '@twurple/api';
import { Router } from 'express';
import {
    economyRedemptionsManager,
    eventSubManager,
    redemptionsManager,
    tokenManager,
    userManager,
} from '../../System';

const rewards = Router();

rewards.post('/create', async (req, res) => {
    const { cost, title, amount } = req.body;
    try {
        const apiClient: ApiClient | undefined = tokenManager.getApiClient(userManager.getUser('cjs0789').userId);
        if (apiClient === undefined) {
            res.status(404).send('User is not registered');
            return;
        }
        const user = await apiClient.users.getUserByName('cjs0789');
        if (user === null) {
            res.status(404).send('Could not find user');
            return;
        }
        const reward = await apiClient.channelPoints.createCustomReward(user, {
            cost,
            title,
        });
        economyRedemptionsManager.addRedemption(1, reward.id, amount);
        const sub = await eventSubManager.subscribeToRedemptionAddEvent(user.id, reward.id);
        if ('error' in sub) {
            await apiClient.channelPoints.deleteCustomReward(user, reward.id);
            res.status(sub.status);
            res.send(sub.message);
            return;
        }
        redemptionsManager.createMetadata(1, reward.id, 'economy');
        res.status(200).send('Reward created and listener attached');
    } catch (e: any) {
        if (e.status === 400) {
            res.status(400);
        } else {
            res.status(500);
        }
        res.send(e.message);
    }
});

export default rewards;

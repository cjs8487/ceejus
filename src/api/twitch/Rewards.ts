import { ApiClient, HelixChannelPointsApi, HelixCustomReward, HelixUser } from '@twurple/api';
import { EventSubChannelRedemptionAddEvent, EventSubListener } from '@twurple/eventsub/lib';
import { Router } from 'express';
import TokenManager from 'src/auth/TokenManager';
import UserManager from 'src/database/UserManager';

const rewards = Router();

let tokenManager: TokenManager;
let userManager: UserManager;
let eventSubListener: EventSubListener;

const handleRedemption = (
    data: EventSubChannelRedemptionAddEvent,
    user: HelixUser,
    apiClient: ApiClient,
    reward: HelixCustomReward,
) => {
    console.log(`${data.userDisplayName} redeemed ${data.rewardTitle} in ${reward.broadcasterDisplayName}'s channel`)
    apiClient.channelPoints.updateRedemptionStatusByIds(user, data.rewardId, [data.id], 'FULFILLED')
};

rewards.use((req, res, next) => {
    if (tokenManager === undefined) {
        tokenManager = req.app.get('tokenManager');
    }
    if (userManager === undefined) {
        userManager = req.app.get('userManager');
    }
    if (eventSubListener === undefined) {
        eventSubListener = req.app.get('eventSubListener');
    }
    next();
});

rewards.post('/create', async (req, res) => {
    try {
        const { cost, title } = req.body;
        const apiClient: ApiClient | undefined = tokenManager.getApiClient(userManager.getUser('cjs0789').userId);
        // eslint-disable-next-line no-underscore-dangle
        console.log(apiClient?._authProvider.currentScopes);
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
        eventSubListener.subscribeToChannelRedemptionAddEventsForReward(user, reward.id, (data) => {
            handleRedemption(data, user, apiClient, reward);
        });
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

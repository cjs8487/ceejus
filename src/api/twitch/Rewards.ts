import { ApiClient } from '@twurple/api/lib';
import { Router } from 'express';

const rewards = Router();

let apiClient: ApiClient;

rewards.use((req, res, next) => {
    if (apiClient === undefined) {
        apiClient = req.app.get('apiClient');
    }
    next();
});

rewards.post('/create', async (req, res) => {
    const { cost, title } = req.body;
    const user = await apiClient.users.getUserByName('cjs0789');
    if (user === null) {
        res.status(404).send('Could not find user');
        return;
    }
    const reward = await apiClient.channelPoints.createCustomReward(user, {
        cost,
        title,
    });
    res.status(200).send(reward);
});

export default rewards;

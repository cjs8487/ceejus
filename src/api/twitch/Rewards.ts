import { Router } from 'express';
import { isAuthenticated } from '../APICore';
import { apiClient } from '../../auth/TwitchAuth';
import {
    addRedemption,
    getRedemption,
    getAllRedemptionsForUser,
    deleteRedemption,
} from '../../database/EconomyRedemptions';
import { createMetadata, deleteMetadata } from '../../database/Redemptions';
import { subscribeToRedemptionAddEvent } from '../../lib/TwitchEventSub';
import { getUser } from '../../database/Users';
import { EconomyReward } from '../../types';

const rewards = Router();

rewards.post('/create', async (req, res) => {
    const { cost, title, amount } = req.body;
    try {
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
        addRedemption(1, reward.id, amount);
        const sub = await subscribeToRedemptionAddEvent(user.id, reward.id);
        if ('error' in sub) {
            await apiClient.channelPoints.deleteCustomReward(user, reward.id);
            res.status(sub.status);
            res.send(sub.message);
            return;
        }
        createMetadata(1, reward.id, 'economy');
        res.status(200).send('Reward created and listener attached');
    } catch (e: any) {
        if (e.status === 400) {
            res.status(400);
        } else {
            res.status(500);
        }
        res.send(JSON.parse(e.body).message);
        console.log(e);
    }
});

rewards.get('/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const realId = Number(id);
    if (Number.isNaN(realId)) {
        res.status(400).send('Bad request');
        return;
    }
    const meta = getRedemption(realId);
    res.status(200).send(meta);
});

rewards.get('/', isAuthenticated, async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = getUser(req.session.user.userId);
    if (!user) {
        res.sendStatus(401);
        return;
    }
    const metas = getAllRedemptionsForUser(req.session.user.userId);
    const responses: EconomyReward[] = [];
    await Promise.all(
        metas.map(async (meta) => {
            const twitchReward =
                await apiClient.channelPoints.getCustomRewardById(
                    user?.twitchId,
                    meta.twitchRewardId,
                );
            if (!twitchReward) {
                console.log('no twitch reward');
                return;
            }
            console.log(responses);
            responses.push({
                id: meta.redemptionId,
                rewardId: twitchReward.id,
                title: twitchReward.title,
                cost: twitchReward.cost,
                amount: meta.amount,
                image: twitchReward.getImageUrl(4),
            });
        }),
    );
    res.status(200).send(responses);
});

rewards.delete('/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const realId = Number(id);
    if (Number.isNaN(realId)) {
        res.status(400).send('Bad request');
        return;
    }
    deleteRedemption(realId);
    deleteMetadata(realId);
    res.sendStatus(200);
});

export default rewards;

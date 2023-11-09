import { Router } from 'express';
import { isAuthenticated } from '../APICore';
import { apiClient } from '../../auth/TwitchAuth';
import {
    addRedemption,
    getRedemption,
    getAllRedemptionsForUser,
    updateRedemptionAmount,
    deleteRedemptionByRewardId,
} from '../../database/EconomyRedemptions';
import {
    createMetadata,
    deleteMetadata,
    getMetadata,
} from '../../database/Redemptions';
import { subscribeToRedemptionAddEvent } from '../../lib/TwitchEventSub';
import { getUser } from '../../database/Users';
import { EconomyReward } from '../../types';
import { logInfo } from '../../Logger';

const economyRewards = Router();

economyRewards.post('/create', async (req, res) => {
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
    }
});

economyRewards.get('/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const realId = Number(id);
    if (Number.isNaN(realId)) {
        res.status(400).send('Bad request');
        return;
    }
    const meta = getRedemption(realId);
    res.status(200).send(meta);
});

economyRewards.post('/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { title, cost, amount } = req.body;
    const realId = Number(id);
    if (Number.isNaN(realId)) {
        res.sendStatus(400);
    }
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = getUser(req.session.user.userId);
    if (!user) {
        res.sendStatus(401);
        return;
    }

    const meta = getMetadata(realId);
    apiClient.channelPoints.updateCustomReward(
        user.twitchId,
        meta.twitchRewardId,
        {
            title,
            cost,
        },
    );
    updateRedemptionAmount(meta.twitchRewardId, amount);
    res.sendStatus(200);
});

economyRewards.get('/', isAuthenticated, async (req, res) => {
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
    let quit = false;
    await Promise.all(
        metas.map(async (meta) => {
            if (quit) return;
            try {
                const twitchReward =
                    await apiClient.channelPoints.getCustomRewardById(
                        user?.twitchId,
                        meta.twitchRewardId,
                    );
                if (!twitchReward) {
                    return;
                }
                responses.push({
                    id: meta.redemptionId,
                    rewardId: twitchReward.id,
                    title: twitchReward.title,
                    cost: twitchReward.cost,
                    amount: meta.amount,
                    image: twitchReward.getImageUrl(4),
                });
            } catch (e: any) {
                if (e.statusCode === 404) {
                    // the reward was deleted through some other service
                    logInfo(
                        `Twitch reward data ${meta.twitchRewardId} not found; deleting internal records for reward`,
                    );
                    deleteMetadata(meta.redemptionId);
                    deleteRedemptionByRewardId(meta.twitchRewardId);
                } else {
                    res.sendStatus(500);
                    quit = true;
                }
            }
        }),
    );
    if (quit) return;
    res.status(200).send(responses);
});

economyRewards.delete('/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const realId = Number(id);
    if (Number.isNaN(realId)) {
        res.status(400).send('Bad request');
        return;
    }
    const user = getUser(req.session.user!.userId);
    if (!user) {
        res.sendStatus(401);
        return;
    }
    const meta = getMetadata(realId);
    deleteMetadata(realId);
    deleteRedemptionByRewardId(meta.twitchRewardId);
    apiClient.channelPoints.deleteCustomReward(
        user.twitchId,
        meta.twitchRewardId,
    );
    res.sendStatus(200);
});

export default economyRewards;

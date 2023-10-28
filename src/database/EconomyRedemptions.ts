import { db } from '../System';

export type EconomyRedemption = {
    redemptionId: number;
    owner: number;
    twitchRewardId: string;
    amount: number;
};

type DBRedemption = {
    // eslint-disable-next-line camelcase
    redemption_id: number;
    owner: number;
    // eslint-disable-next-line camelcase
    twitch_reward_id: string;
    amount: number;
};

export const addRedemption = (
    owner: number,
    twitchId: string,
    amount: number,
) => {
    db.prepare(
        'insert into economy_redemptions (owner, twitch_reward_id, amount) values (?, ?, ?)',
    ).run(owner, twitchId, amount);
};

export const getRedemption = (id: string | number): EconomyRedemption => {
    let sql = 'select * from economy_redemptions ';
    if (typeof id === 'string') {
        sql += 'where twitch_reward_id=?';
    } else {
        sql += 'where redemption_id=?';
    }
    const redemption: DBRedemption = db.prepare(sql).get(id);
    return {
        redemptionId: redemption.redemption_id,
        owner: redemption.owner,
        twitchRewardId: redemption.twitch_reward_id,
        amount: redemption.amount,
    };
};

export const getAllRedemptions = (): EconomyRedemption[] => {
    const results: DBRedemption[] = db
        .prepare('select * from economy_redmeptions')
        .all();
    return results.map((result: DBRedemption) => ({
        redemptionId: result.redemption_id,
        owner: result.owner,
        twitchRewardId: result.twitch_reward_id,
        amount: result.amount,
    }));
};

export const getAllRedemptionsForUser = (id: number): EconomyRedemption[] => {
    const results: DBRedemption[] = db
        .prepare('select * from economy_redemptions where owner=?')
        .all(id);
    return results.map((result: DBRedemption) => ({
        redemptionId: result.redemption_id,
        owner: result.owner,
        twitchRewardId: result.twitch_reward_id,
        amount: result.amount,
    }));
};

export const updateRedemptionAmount = (rewardId: string, amount: number) => {
    db.prepare(
        'update economy_redemptions set amount=? where twitch_reward_id=?',
    ).run(amount, rewardId);
};

export const deleteRedemption = (id: number) => {
    db.prepare('delete from economy_redemptions where redemption_id=?').run(id);
};

export const deleteRedemptionByRewardId = (rewardId: string) => {
    db.prepare('delete from economy_redemptions where twitch_reward_id=?').run(
        rewardId,
    );
};

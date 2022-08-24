import { Database } from 'better-sqlite3';

export type EconomyRedemption = {
    redemptionId: number,
    owner: number,
    twitchRewardId: string,
    amount: number,
}

type DBRedemption = {
    // eslint-disable-next-line camelcase
    redemption_id: number,
    owner: number,
    // eslint-disable-next-line camelcase
    twitch_reward_id: string,
    amount: number,
}

export class EconomyRedemptionsManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    addRedemption(owner: number, twitchId: string, amount: number) {
        this.db.prepare(
            'insert into economy_redemptions (owner, twitch_reward_id, amount) values (?, ?, ?)',
        ).run(owner, twitchId, amount);
    }

    getRedemption(twitchId: string): EconomyRedemption {
        const redemption: DBRedemption = this.db.prepare('select * from economy_redemptions where twitch_reward_id=?')
            .get(twitchId);
        return {
            redemptionId: redemption.redemption_id,
            owner: redemption.owner,
            twitchRewardId: redemption.twitch_reward_id,
            amount: redemption.amount,
        };
    }

    getAllRedemptions(): EconomyRedemption[] {
        const results: DBRedemption[] = this.db.prepare('select * from economy_redmeptions').all();
        return results.map((result: DBRedemption) => ({
            redemptionId: result.redemption_id,
            owner: result.owner,
            twitchRewardId: result.twitch_reward_id,
            amount: result.amount,
        }));
    }
}

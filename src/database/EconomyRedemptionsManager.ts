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

    getRedemption(id: string): EconomyRedemption;
    getRedemption(id: number): EconomyRedemption;
    getRedemption(id: string | number): EconomyRedemption {
        let sql = 'select * from economy_redemptions ';
        if (typeof id === 'string') {
            sql += 'where twitch_reward_id=?';
        } else {
            sql += 'where redemption_id=?';
        }
        const redemption: DBRedemption = this.db.prepare(sql)
            .get(id);
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

    getAllRedemptionsForUser(id: number): EconomyRedemption[] {
        const results: DBRedemption[] = this.db.prepare('select * from economy_redemptions where owner=?')
            .all(id);
        return results.map((result: DBRedemption) => ({
            redemptionId: result.redemption_id,
            owner: result.owner,
            twitchRewardId: result.twitch_reward_id,
            amount: result.amount,
        }));
    }

    deleteRedemption(id: number) {
        this.db.prepare('delete from economy_redemptions where redemption_id=?').run(id);
    }
}

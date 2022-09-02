import { Database } from 'better-sqlite3';

export type RedemptionMetadata = {
    metaId: number,
    owner: number,
    twitchRewardId: string,
    module: string,
    type?: string,
}

type DBMetadata = {
    // eslint-disable-next-line camelcase
    meta_id: number,
    owner: number,
    // eslint-disable-next-line camelcase
    twitch_reward_id: string,
    module: string,
    type?: string,
}

export class RedemptionsManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    getMetadata(id: number): RedemptionMetadata;
    getMetadata(id: string): RedemptionMetadata;
    getMetadata(id: number | string): RedemptionMetadata {
        let sql = 'select * from redemption_metadata where ';
        if (typeof id === 'number') {
            sql += 'meta_id=?';
        } else {
            sql += 'twitch_reward_id=?';
        }
        const redemption: DBMetadata = this.db.prepare(sql).get(id);
        return {
            metaId: redemption.meta_id,
            owner: redemption.owner,
            twitchRewardId: redemption.twitch_reward_id,
            module: redemption.module,
            type: redemption.type,
        };
    }

    getAllMetadataForUser(id: number): RedemptionMetadata[] {
        const redemptions: DBMetadata[] = this.db.prepare('select * from redemption_metadata where owner=?').all(id);
        if (redemptions === undefined) {
            return [];
        }
        return redemptions.map((redemption: DBMetadata) => ({
            metaId: redemption.meta_id,
            owner: redemption.owner,
            twitchRewardId: redemption.twitch_reward_id,
            module: redemption.module,
            type: redemption.type,
        }));
    }

    createMetadata(owner: number, twitchRewardId: string, module: string, type?: string): void {
        this.db.prepare('insert into redemption_metadata (owner, twitch_reward_id, module, type) values (?, ?, ?, ?)')
            .run(owner, twitchRewardId, module, type);
    }

    deleteMetadata(id: number): void;
    deleteMetadata(id: string): void;
    deleteMetadata(id: number | string): void {
        let sql = 'delete from redemption_metadata ';
        if (typeof id === 'number') {
            sql += 'where meta_id=?';
        } else {
            sql += 'where twitch_reward_id=?';
        }
        this.db.prepare(sql).run(id);
    }
}

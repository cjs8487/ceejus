import { db } from '../System';
import { EconomyConfiguration } from '../types';

type DBConfig = {
    info_id: number;
    owner: number;
    currency_name: string;
    earn_rate: number;
    require_active: number;
    minimum_gamble: number;
};

export const getEconomyConfig = (
    userId: number,
): EconomyConfiguration | undefined => {
    const config: DBConfig | undefined = db
        .prepare('select * from economy_config where owner=?')
        .get(userId);
    if (!config) {
        return undefined;
    }
    return {
        currencyName: config.currency_name,
        passiveRate: config.earn_rate,
        requireActive: !!config.require_active,
        minimumGamble: config.minimum_gamble,
    };
};

export const updateEconomyConfig = (
    userId: number,
    currencyName: string,
    passiveRate: number,
    requireActive: boolean,
    minimumGamble: number,
) => {
    db.prepare(
        'update economy_config set currency_name=?, earn_rate=?, minimum_gamble=?, require_active=? where owner=?',
    ).run(
        currencyName,
        passiveRate,
        minimumGamble,
        requireActive ? 1 : 0,
        userId,
    );
};

export const createEconomyConfig = (userId: number) => {
    db.prepare(
        // eslint-disable-next-line max-len
        'insert into economy_config (owner, currency_name, earn_rate, require_active, minimum_gamble) values (?, ?, 5, 0, 10)',
    ).run(userId, '');
};

export const connectDiscordServer = (userId: number, discordServer: string) => {
    db.prepare(
        'insert into discord_economy_connection (owner, discord_server) values (?, ?)',
    ).run(userId, discordServer);
};

export const disconnectDiscordServer = (discordServer: string) => {
    db.prepare(
        'delete from discord_economy_connection where discord_server=?',
    ).run(discordServer);
};

export const getEconomyOwnerForDiscordServer = (
    discordServer: string,
): number | undefined => {
    const connection: { owner: number } = db
        .prepare(
            'select owner from discord_economy_connection where discord_server=?',
        )
        .get(discordServer);
    return connection?.owner;
};

import _ from 'lodash';
import { createSlashCommand } from '../SlashCommand';
import { authCheck, economyIsConnected } from '../../../DiscordUtils';
import {
    gambleLoss,
    gambleWin,
    getCurrency,
} from '../../../../database/Economy';
import { getUserByDiscordId } from '../../../../database/Users';
import { logError } from '../../../../Logger';

const gambleCommand = createSlashCommand({
    name: 'gamble',
    description: 'Gamble your currency for a chance to win big.',
    options: [
        {
            name: 'amount',
            description: 'the amount of currency to wager',
            type: 'integer',
            min: 0,
        },
        {
            name: 'all',
            description: 'If true, you will wager all of your currency',
            type: 'boolean',
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
        const [economyConfig, economyOwner] =
            await economyIsConnected(interaction);
        if (!economyConfig || !economyOwner) return;
        const authorized = await authCheck(interaction);
        if (authorized) {
            const amount = interaction.options.getInteger('amount');
            const all = interaction.options.getBoolean('all');
            if (!amount && !all) {
                await interaction.editReply(
                    'You must specify either an amount or all',
                );
                return;
            }
            const user = getUserByDiscordId(interaction.user.id);
            if (!user) {
                logError(
                    'Unable to retrieve user data despite a valid auth check',
                );
                await interaction.editReply(
                    'An error occurred, try again later.',
                );
                return;
            }
            const total = getCurrency(user.userId, economyOwner);
            let gambleAmount: number = 0;
            if (all) {
                gambleAmount = total;
            }
            if (amount) {
                if (amount > total) {
                    await interaction.editReply(
                        `Cannot gamble more ${economyConfig.currencyName} than you have`,
                    );
                    return;
                }
                gambleAmount = amount;
            }
            if (_.random(1) === 0) {
                gambleLoss(user.userId, 1, gambleAmount);
                await interaction.editReply(
                    `You lost ${gambleAmount} ${economyConfig.currencyName}`,
                );
                return;
            }
            gambleWin(user.userId, 1, gambleAmount);
            await interaction.editReply(
                `You won ${gambleAmount} ${economyConfig.currencyName}`,
            );
        }
    },
});

export default gambleCommand;

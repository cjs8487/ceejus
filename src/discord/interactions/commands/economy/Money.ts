import { logError } from '../../../../Logger';
import { getCurrency } from '../../../../database/Economy';
import { getUserByDiscordId } from '../../../../database/Users';
import { authCheck, economyIsConnected } from '../../../DiscordUtils';
import { createSlashCommand } from '../SlashCommand';

const moneyCommand = createSlashCommand({
    name: 'money',
    description: 'Find out how much money you or someone else has',
    options: [
        {
            name: 'user',
            description:
                'The user to see the balance for. If omitted, will showyour balance',
            type: 'user',
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
        const economyConfig = await economyIsConnected(interaction);
        if (!economyConfig) return;
        const authorized = await authCheck(interaction);
        if (authorized) {
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
            await interaction.editReply(
                `${getCurrency(user.userId, 1)} ${economyConfig.currencyName}`,
            );
        }
    },
});

export default moneyCommand;

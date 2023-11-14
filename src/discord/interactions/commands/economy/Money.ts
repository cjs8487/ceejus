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
                'The user to see the balance for. If omitted, will show your balance',
            type: 'user',
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
        const [economyConfig] = await economyIsConnected(interaction);
        if (!economyConfig) return;

        const commandTarget = interaction.options.getUser('user');
        let target;
        if (!commandTarget) {
            const user = getUserByDiscordId(interaction.user.id);
            if (!user) {
                const authorized = await authCheck(interaction);
                if (!authorized) return;
                logError(
                    'Unable to retrieve user data despite a valid auth check',
                );
                await interaction.editReply(
                    'An error occurred, try again later.',
                );
                return;
            }
            target = user;
        } else {
            const user = getUserByDiscordId(commandTarget.id);
            if (!user) {
                await interaction.editReply("Sorry, I don't know who that is.");
                return;
            }
            target = user;
        }
        await interaction.editReply(
            `${getCurrency(target.userId, 1)} ${economyConfig.currencyName}`,
        );
    },
});

export default moneyCommand;

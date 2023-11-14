import { logError } from '../../../../Logger';
import {
    addCurrency,
    getCurrency,
    removeCurrency,
} from '../../../../database/Economy';
import { getUserByDiscordId } from '../../../../database/Users';
import { authCheck, economyIsConnected } from '../../../DiscordUtils';
import { createSlashCommand } from '../SlashCommand';

const giveCommand = createSlashCommand({
    name: 'give',
    description: 'Give a user some of your currency',
    options: [
        {
            name: 'user',
            description: 'The user to give currency to',
            type: 'user',
            required: true,
        },
        {
            name: 'amount',
            description: 'The amount of currency to give',
            type: 'number',
            required: true,
            min: 1,
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
        const [economyConfig, economyOwner] =
            await economyIsConnected(interaction);
        if (!economyConfig || !economyOwner) return;
        const authorized = await authCheck(interaction);
        if (!authorized) return;

        const target = interaction.options.getUser('user', true);
        const targetUser = getUserByDiscordId(target.id);
        if (!targetUser) {
            await interaction.editReply("Sorry, I don't know who that is.");
            return;
        }
        const amount = interaction.options.getNumber('amount', true);
        const user = getUserByDiscordId(interaction.user.id);

        if (!user) {
            logError('Unable to retrieve user data despite a valid auth check');
            await interaction.editReply('An error occurred, try again later.');
            return;
        }

        const total = getCurrency(user.userId, economyOwner);
        if (amount > total) {
            await interaction.editReply(
                `Cannot give away more ${economyConfig.currencyName} than you have`,
            );
            return;
        }
        addCurrency(targetUser.userId, economyOwner, amount);
        removeCurrency(user.userId, economyOwner, amount);
    },
});

export default giveCommand;

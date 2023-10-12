import { createSlashCommand } from '../SlashCommand';
import { authCheck } from '../../../DiscordUtils';

const gambleCommand = createSlashCommand({
    name: 'gamble',
    description: 'Gamble your currency for a chance to win big.',
    options: [
        {
            name: 'amount',
            description: 'the amount of currency to wager',
            type: 'integer',
        },
        {
            name: 'all',
            description: 'If true, you will wager all of your currency',
            type: 'boolean',
        },
    ],
    async run(interaction) {
        await interaction.deferReply();
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
            if (all) {
                //
            }
            if (amount) {
                //
            }
        }
    },
});

export default gambleCommand;

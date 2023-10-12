import { authCheck } from '../../../DiscordUtils';
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
        const authorized = await authCheck(interaction);
        if (authorized) {
            //
        }
    },
});

export default moneyCommand;

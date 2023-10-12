import axios from 'axios';
import { createSlashCommand } from './SlashCommand';

const gdqCommand = createSlashCommand({
    name: 'gdq',
    description:
        'Generates a randomized Games Done Quick style donation comment',
    async run(interaction) {
        await interaction.deferReply();
        const res = await axios.get('https://taskinoz.com/gdq/api');
        interaction.editReply(res.data);
    },
});

export default gdqCommand;

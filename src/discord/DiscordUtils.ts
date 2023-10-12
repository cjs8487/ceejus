import { CommandInteraction } from 'discord.js';
import { discordAuthUrl } from '../Environment';

export const authCheck = async (interaction: CommandInteraction) => {
    await interaction.editReply('You must authorize me first');
    (await interaction.user.createDM()).send(
        `You can authorize me here: ${discordAuthUrl}`,
    );
    return false;
};

export default {};

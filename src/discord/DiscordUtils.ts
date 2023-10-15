import { CommandInteraction } from 'discord.js';
import { discordAuthUrl } from '../Environment';
import { getUserByDiscordId } from '../database/Users';

export const authCheck = async (interaction: CommandInteraction) => {
    const user = getUserByDiscordId(interaction.user.id);
    if (user) {
        return true;
    }
    await interaction.editReply('You must authorize me first');
    (await interaction.user.createDM()).send(
        `You can authorize me here: ${discordAuthUrl}`,
    );
    return false;
};

export default {};

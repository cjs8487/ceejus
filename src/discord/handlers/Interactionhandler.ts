import { Interaction } from 'discord.js';
import { getHandler } from '../interactions/commands/SlashCommandList';

const onInteraction = (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        getHandler(interaction.commandName)(interaction);
    }
};

export default onInteraction;

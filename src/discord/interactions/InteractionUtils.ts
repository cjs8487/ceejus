import { Interaction } from 'discord.js';

export const selfCollectorFilter =
    (interaction: Interaction) => (i: Interaction) =>
        i.user.id === interaction.user.id;

export default {};

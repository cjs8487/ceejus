import {
    ChatInputCommandInteraction,
    CommandInteraction,
    inlineCode,
} from 'discord.js';
import { discordAuthUrl } from '../Environment';
import { getUserByDiscordId } from '../database/Users';
import {
    getEconomyConfig,
    getEconomyOwnerForDiscordServer,
} from '../database/EconomyConfig';
import { logError } from '../Logger';
import { EconomyConfiguration } from '../types';

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

const economyNotConnectedMessage =
    'No economy connection for this server found. Ask the server owner ' +
    `to connect to their economy with the ${inlineCode(
        '/economy connect',
    )} command.`;

export const economyIsConnected = async (
    interaction: ChatInputCommandInteraction,
): Promise<[EconomyConfiguration | undefined, number | undefined]> => {
    const economyOwner = getEconomyOwnerForDiscordServer(interaction.guildId!);
    if (economyOwner) {
        const economyConfig = getEconomyConfig(economyOwner);
        if (!economyConfig) {
            logError(
                `Economy is connected but unable to load configuration for user ${economyOwner}`,
            );
            await interaction.editReply('An error occurred. Try again later');
            return [undefined, undefined];
        }
        return [economyConfig, economyOwner];
    }
    if (interaction.replied || interaction.deferred) {
        await interaction.editReply(economyNotConnectedMessage);
    } else {
        await interaction.reply(economyNotConnectedMessage);
    }
    return [undefined, undefined];
};

export default {};

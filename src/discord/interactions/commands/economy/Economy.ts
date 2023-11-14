import {
    ActionRowBuilder,
    ComponentType,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { createSlashCommand } from '../SlashCommand';
import { selfCollectorFilter } from '../../InteractionUtils';
import { getUserByTwitchId } from '../../../../database/Users';
import {
    connectDiscordServer,
    disconnectDiscordServer,
    getEconomyOwnerForDiscordServer,
} from '../../../../database/EconomyConfig';

const economyCommand = createSlashCommand({
    name: 'economy',
    description: 'Core economy controls',
    subcommands: [
        {
            name: 'connect',
            description: 'Connect this server to a Ceejus economy',
            async run(interaction) {
                await interaction.deferReply({ ephemeral: true });
                if (!interaction.guild) {
                    interaction.editReply(
                        'Economy commands are not supported in direct messages',
                    );
                    return;
                }
                if (getEconomyOwnerForDiscordServer(interaction.guild.id)) {
                    interaction.editReply(
                        'This server is already connected to a Ceejus economy.',
                    );
                    return;
                }
                const integrations =
                    await interaction.guild.fetchIntegrations();
                const twitchIntegrations = integrations.filter(
                    (integration) => {
                        if (integration.type !== 'twitch') {
                            return false;
                        }
                        const user = getUserByTwitchId(integration.account.id);
                        // check user exists
                        if (!user) {
                            return false;
                        }
                        // check user is active
                        if (!user.active) {
                            return false;
                        }
                        // TODO: check user has economy enabled
                        return true;
                    },
                );

                if (twitchIntegrations.size === 0) {
                    await interaction.editReply(
                        'No eligible Twitch connections found for this server. In order to connect a server to a ' +
                            'Ceejus economy, it must have a Twitch integration connected to an account that is ' +
                            'registered with Ceejus and has the economy module enabled',
                    );
                    return;
                }

                if (twitchIntegrations.size === 1) {
                    const twitchAccount = twitchIntegrations.at(0)!.account;
                    const user = getUserByTwitchId(twitchAccount.id);
                    connectDiscordServer(user!.userId, interaction.guild.id);
                    interaction.editReply(
                        `Economy connected to ${twitchAccount.name}. Economy commands are now enabled.`,
                    );
                } else {
                    const options: StringSelectMenuOptionBuilder[] = [];

                    twitchIntegrations.forEach((integration) => {
                        options.push(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(integration.account.name)
                                .setValue(integration.id),
                        );
                    });

                    const accountSelect = new StringSelectMenuBuilder()
                        .setCustomId('account')
                        .setPlaceholder('Select the account to connect')
                        .addOptions(options);
                    const row =
                        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                            accountSelect,
                        );

                    const response = await interaction.editReply({
                        content: 'Select account to connect to',
                        components: [row],
                    });

                    try {
                        const confirmation =
                            await response.awaitMessageComponent<ComponentType.StringSelect>(
                                {
                                    filter: selfCollectorFilter(interaction),
                                    time: 60000,
                                },
                            );
                        const twitchAccount = integrations.get(
                            confirmation.values[0],
                        )!.account;
                        const user = getUserByTwitchId(twitchAccount.id);
                        connectDiscordServer(
                            user!.userId,
                            interaction.guild.id,
                        );
                        confirmation.update({
                            content: `Economy connected to ${twitchAccount.name}. Economy commands are now enabled.`,
                            components: [],
                        });
                    } catch {
                        await interaction.editReply(
                            'No confirmation received. Connection attempt aborted.',
                        );
                    }
                }
            },
        },
        {
            name: 'disconnect',
            description:
                'Disconnect this server from its currently connected Ceejus economy',
            async run(interaction) {
                await interaction.deferReply({ ephemeral: true });
                if (!interaction.guild) {
                    interaction.editReply(
                        'Economy commands are not supported in direct messages.',
                    );
                    return;
                }
                if (!getEconomyOwnerForDiscordServer(interaction.guild.id)) {
                    interaction.editReply(
                        'This server is not connected to a Ceejus economy.',
                    );
                    return;
                }
                disconnectDiscordServer(interaction.guild.id);
                interaction.editReply(
                    'Successfully disconnected from the economy.',
                );
            },
        },
    ],
});

export default economyCommand;

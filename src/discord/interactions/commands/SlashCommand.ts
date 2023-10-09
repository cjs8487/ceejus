import {
    ChatInputCommandInteraction,
    SharedSlashCommandOptions,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    SlashCommandUserOption,
} from 'discord.js';
import { logError, logWarn } from '../../../Logger';

type SlashCommandRun = (
    interaction: ChatInputCommandInteraction,
) => Promise<void>;

export interface SlashCommand {
    data:
        | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
        | SlashCommandSubcommandsOnlyBuilder;
    run: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

type SlashCommandOptionBase = {
    name: string;
    description: string;
    required?: boolean;
};

type SlashCommandChoice<T> = {
    name: string;
    value: T;
};

type SlashCommandStringOptionData = SlashCommandOptionBase & {
    type: 'string';
    choices?: SlashCommandChoice<string>[];
    minLength?: number;
    maxLength?: number;
};

type SlashCommandBooleanOptionData = SlashCommandOptionBase & {
    type: 'boolean';
};

type SlashCommandNumberOptionData = SlashCommandOptionBase & {
    type: 'number';
    choices?: SlashCommandChoice<number>[];
    min?: number;
    max?: number;
};

type SlashCommandIntegerOptionData = SlashCommandOptionBase & {
    type: 'integer';
    choices?: SlashCommandChoice<number>[];
    min?: number;
    max?: number;
};

type SlashCommandMentionableOptionData = SlashCommandOptionBase & {
    type: 'mentionable';
};

type SlashCommandChannelOptionData = SlashCommandOptionBase & {
    type: 'channel';
    channelTypes?: InstanceType<
        typeof SlashCommandChannelOption
    >['channel_types'];
};

type SlashCommandRoleOptionData = SlashCommandOptionBase & {
    type: 'role';
};

type SlashCommandUserOptionData = SlashCommandOptionBase & {
    type: 'user';
};

type SlashCommandOption =
    | SlashCommandStringOptionData
    | SlashCommandBooleanOptionData
    | SlashCommandNumberOptionData
    | SlashCommandIntegerOptionData
    | SlashCommandMentionableOptionData
    | SlashCommandChannelOptionData
    | SlashCommandRoleOptionData
    | SlashCommandUserOptionData;

type SlashCommandSubcommand = {
    name: string;
    description: string;
    options?: SlashCommandOption[];
    run: SlashCommandRun;
};

type SlashCommandSubcommandGroup = {
    name: string;
    description: string;
    subcommands: SlashCommandSubcommand[];
};

type SlashCommandData = {
    name: string;
    description: string;
    options?: SlashCommandOption[];
    subcommands?: SlashCommandSubcommand[];
    subcommandGroups?: SlashCommandSubcommandGroup[];
    run?: SlashCommandRun;
};

const createOptions = (
    builder: SharedSlashCommandOptions,
    options: SlashCommandOption[],
) => {
    options.forEach((option) => {
        switch (option.type) {
            case 'string': {
                const optionBuilder = new SlashCommandStringOption();
                optionBuilder
                    .setName(option.name)
                    .setDescription(option.description);
                if (option.required) {
                    optionBuilder.setRequired(true);
                }
                if (option.choices) {
                    optionBuilder.addChoices(...option.choices);
                }
                if (option.minLength) {
                    optionBuilder.setMinLength(option.minLength);
                }
                if (option.maxLength) {
                    optionBuilder.setMaxLength(option.maxLength);
                }
                builder.addStringOption(optionBuilder);
                break;
            }
            case 'boolean': {
                const optionBuilder = new SlashCommandBooleanOption();
                optionBuilder
                    .setName(option.name)
                    .setDescription(option.description);
                if (option.required) {
                    optionBuilder.setRequired(true);
                }
                builder.addBooleanOption(optionBuilder);
                break;
            }
            case 'number': {
                const optionBuilder = new SlashCommandNumberOption();
                optionBuilder
                    .setName(option.name)
                    .setDescription(option.description);
                if (option.required) {
                    optionBuilder.setRequired(true);
                }
                if (option.choices) {
                    optionBuilder.setChoices(...option.choices);
                }
                if (option.min) {
                    optionBuilder.setMinValue(option.min);
                }
                if (option.max) {
                    optionBuilder.setMaxValue(option.max);
                }
                builder.addNumberOption(optionBuilder);
                break;
            }
            case 'integer': {
                const optionBuilder = new SlashCommandIntegerOption();
                optionBuilder
                    .setName(option.name)
                    .setDescription(option.description);
                if (option.required) {
                    optionBuilder.setRequired(true);
                }
                if (option.choices) {
                    optionBuilder.setChoices(...option.choices);
                }
                if (option.min) {
                    optionBuilder.setMinValue(option.min);
                }
                if (option.max) {
                    optionBuilder.setMaxValue(option.max);
                }
                builder.addIntegerOption(optionBuilder);
                break;
            }
            case 'mentionable': {
                const optionBuilder = new SlashCommandMentionableOption();
                optionBuilder
                    .setName(option.name)
                    .setDescription(option.description);
                if (option.required) {
                    optionBuilder.setRequired(true);
                }
                builder.addMentionableOption(optionBuilder);
                break;
            }
            case 'channel': {
                const optionBuilder = new SlashCommandChannelOption();
                optionBuilder
                    .setName(option.name)
                    .setDescription(option.description);
                if (option.required) {
                    optionBuilder.setRequired(true);
                }
                if (option.channelTypes) {
                    optionBuilder.addChannelTypes(...option.channelTypes);
                }
                builder.addChannelOption(optionBuilder);
                break;
            }
            case 'role': {
                const optionBuilder = new SlashCommandRoleOption();
                optionBuilder
                    .setName(option.name)
                    .setDescription(option.description);
                if (option.required) {
                    optionBuilder.setRequired(true);
                }
                builder.addRoleOption(optionBuilder);
                break;
            }
            case 'user': {
                const optionBuilder = new SlashCommandUserOption();
                optionBuilder
                    .setName(option.name)
                    .setDescription(option.description);
                if (option.required) {
                    optionBuilder.setRequired(true);
                }
                builder.addUserOption(optionBuilder);
                break;
            }
            default:
                logWarn(`Command fell through while creating options`);
        }
    });
};

const createSubcommand = (
    subcommand: SlashCommandSubcommand,
): SlashCommandSubcommandBuilder => {
    const builder = new SlashCommandSubcommandBuilder();
    builder.setName(subcommand.name).setDescription(subcommand.description);

    if (subcommand.options) {
        createOptions(builder, subcommand.options ?? []);
    }
    return builder;
};

export const createSlashCommand = (command: SlashCommandData): SlashCommand => {
    const builder = new SlashCommandBuilder();
    builder.setName(command.name).setDescription(command.description);

    if (command.options) {
        createOptions(builder, command.options);
    }

    command.subcommands?.forEach((subcommand) => {
        builder.addSubcommand(createSubcommand(subcommand));
    });

    command.subcommandGroups?.forEach((subcommandGroup) => {
        const groupBuilder = new SlashCommandSubcommandGroupBuilder();
        groupBuilder
            .setName(subcommandGroup.name)
            .setDescription(subcommandGroup.description);
        subcommandGroup.subcommands.forEach((subcommand) => {
            groupBuilder.addSubcommand(createSubcommand(subcommand));
        });
        builder.addSubcommandGroup(groupBuilder);
    });

    const run = async (interaction: ChatInputCommandInteraction) => {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        if (group) {
            const foundGroup = command.subcommandGroups?.find(
                (g) => g.name === group,
            );
            if (foundGroup) {
                const foundSub = foundGroup.subcommands.find(
                    (s) => s.name === subcommand,
                );
                if (foundSub) {
                    foundSub.run(interaction);
                } else {
                    logError(
                        `Unable to handle interaction for ${interaction.commandName}. No matching subcommand found`,
                    );
                }
            } else {
                logError(
                    `Unable to handle interaction for ${interaction.commandName}. No matching subcommand group found`,
                );
            }
            return;
        }
        if (subcommand) {
            const foundSub = command.subcommands?.find(
                (s) => s.name === subcommand,
            );
            if (foundSub) {
                foundSub.run(interaction);
            } else {
                logError(
                    `Unable to handle interaction for ${interaction.commandName}. No matching subcommand found`,
                );
            }
            return;
        }
        if (command.run) {
            command.run(interaction);
            return;
        }
        logError(
            `Unable to handle interaction for ${interaction.commandName}. No top level handler specified`,
        );
    };

    return { data: builder, run };
};

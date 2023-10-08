import {
    addQuote,
    getLatestQuote,
    getQuote,
    getQuoteAlias,
    getRandomQuote,
    searchQuote,
} from '../../../database/quotes/Quotes';
import {
    permissionDeniedEmbed,
    quoteCreateEmbed,
    quoteEmbed,
    quoteErrorEmbed,
    quoteMultiEmbed,
} from '../../Embeds';
import { SlashCommand, createSlashCommand } from './SlashCommand';

const quotePermDenied = permissionDeniedEmbed(
    'Ceejus - Quotes',
    'Mod permission check for quotes module failed',
);

const quoteCommand: SlashCommand = createSlashCommand({
    name: 'quote',
    description: 'Quotes commands',
    subcommands: [
        {
            name: 'get',
            description:
                'Gets a quote. If no parameters a specified, a random quote will be retrieved',
            options: [
                {
                    name: 'number',
                    description: 'Quote number to retrieve',
                    type: 'integer',
                },
                {
                    type: 'string',
                    name: 'alias',
                    description: 'Alias of the desired quote',
                },
            ],
            run: async (interaction) => {
                await interaction.deferReply();
                const num = interaction.options.getInteger('number');
                const alias = interaction.options.getString('alias');
                if (num) {
                    const quote = getQuote(num);
                    if (quote) {
                        await interaction.editReply({
                            embeds: [quoteEmbed(quote)],
                        });
                    } else {
                        await interaction.editReply({
                            embeds: [
                                quoteErrorEmbed(`Quote #${num} does not exist`),
                            ],
                        });
                    }
                } else if (alias) {
                    const quote = getQuoteAlias(alias);
                    if (quote) {
                        await interaction.editReply({
                            embeds: [quoteEmbed(quote)],
                        });
                    } else {
                        await interaction.editReply({
                            embeds: [
                                quoteErrorEmbed(
                                    `Quote with alias "${alias}" does not exist`,
                                ),
                            ],
                        });
                    }
                } else {
                    const quote = getRandomQuote();
                    if (quote) {
                        await interaction.editReply({
                            embeds: [quoteEmbed(quote)],
                        });
                    } else {
                        await interaction.editReply({
                            embeds: [quoteErrorEmbed(`There are no quotes`)],
                        });
                    }
                }
            },
        },
        {
            name: 'add',
            description: 'Adds a new quote',
            options: [
                {
                    type: 'string',
                    name: 'quote',
                    description: 'Quote to add',
                    required: true,
                },
            ],
            run: async (interaction) => {
                await interaction.deferReply();
                const quote = interaction.options.getString('quote', true);
                const result = addQuote(quote, interaction.user.username);
                await interaction.editReply({
                    embeds: [quoteCreateEmbed(result, quote)],
                });
            },
        },
        {
            name: 'delete',
            description: 'Delete a quote',
            options: [
                {
                    name: 'number',
                    description: 'Quote number to delete',
                    type: 'integer',
                    required: true,
                },
            ],
            run: async (interaction) => {
                await interaction.reply({
                    embeds: [quotePermDenied],
                });
            },
        },
        {
            name: 'edit',
            description: 'Edit a quote',
            options: [
                {
                    name: 'number',
                    description: 'Quote number to edit',
                    type: 'integer',
                    required: true,
                },
                {
                    type: 'string',
                    name: 'quote',
                    description: 'New quote',
                    required: true,
                },
            ],
            run: async (interaction) => {
                await interaction.reply({
                    embeds: [quotePermDenied],
                });
            },
        },
        {
            name: 'search',
            description: 'Search for quotes',
            options: [
                {
                    type: 'string',
                    name: 'search',
                    description: 'The text to search for',
                    required: true,
                },
            ],
            run: async (interaction) => {
                await interaction.deferReply();
                const search = interaction.options.getString('search', true);
                const results = searchQuote(search);
                if ('error' in results) {
                    await interaction.editReply({
                        embeds: [quoteErrorEmbed(results.error)],
                    });
                } else if (results.length === 1) {
                    await interaction.editReply({
                        embeds: [quoteEmbed(results[0])],
                    });
                } else {
                    await interaction.editReply({
                        embeds: [quoteMultiEmbed(results)],
                    });
                }
            },
        },
        {
            name: 'latest',
            description: 'Get the most recent quote',
            run: async (interaction) => {
                await interaction.deferReply();
                const quote = getLatestQuote();
                if (quote) {
                    await interaction.editReply({
                        embeds: [quoteEmbed(quote)],
                    });
                } else {
                    await interaction.editReply({
                        embeds: [quoteErrorEmbed('There are no quotes')],
                    });
                }
            },
        },
    ],
});

export default quoteCommand;

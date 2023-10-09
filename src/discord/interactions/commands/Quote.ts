import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import {
    addQuote,
    getLatestQuote,
    getQuote,
    getQuoteAlias,
    getRandomQuote,
    searchQuote,
} from '../../../database/quotes/Quotes';
import {
    author,
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

const flohaQuoteEmbed = (data: any) =>
    new EmbedBuilder()
        .setColor('#0099ff')
        .setAuthor(author('Flohabot - Quotes'))
        .setTitle(`Quote #${data.id}`)
        .setDescription(data.quote_text)
        .setFields({
            name: 'Quoted on',
            value: data.creation_date,
            inline: true,
        })
        .setFooter({ text: `Also known as: ${data.alias}` });

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
        {
            name: 'remote',
            description: 'Gets quotes from an external quote database',
            options: [
                {
                    type: 'string',
                    name: 'source',
                    description: 'The remote source to retrieve from',
                    choices: [{ name: 'Flohabot', value: 'floha' }],
                    required: true,
                },
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
                const source = interaction.options.getString('source', true);
                const num = interaction.options.getInteger('number');
                const alias = interaction.options.getString('alias');
                if (source === 'floha') {
                    if (num) {
                        const { data, status } = await axios.get(
                            `https://flohabot.bingothon.com/api/quotes/quote?quoteNumber=${num}`,
                        );
                        if (status === 200) {
                            await interaction.editReply({
                                embeds: [flohaQuoteEmbed(data)],
                            });
                        } else {
                            await interaction.editReply({
                                embeds: [
                                    quoteErrorEmbed(
                                        'The remote source returned an error. Please try again later ',
                                    ),
                                ],
                            });
                        }
                    } else if (alias) {
                        const { data, status } = await axios.get(
                            `https://flohabot.bingothon.com/api/quotes/quote?alias=${alias}`,
                        );
                        if (status === 200) {
                            await interaction.editReply({
                                embeds: [flohaQuoteEmbed(data)],
                            });
                        } else {
                            await interaction.editReply({
                                embeds: [
                                    quoteErrorEmbed(
                                        'The remote source returned an error. Please try again later ',
                                    ),
                                ],
                            });
                        }
                    } else {
                        const { data, status } = await axios.get(
                            `https://flohabot.bingothon.com/api/quotes/quote`,
                        );
                        if (status === 200) {
                            await interaction.editReply({
                                embeds: [flohaQuoteEmbed(data)],
                            });
                        } else {
                            await interaction.editReply({
                                embeds: [
                                    quoteErrorEmbed(
                                        'The remote source returned an error. Please try again later ',
                                    ),
                                ],
                            });
                        }
                    }
                } else {
                    await interaction.editReply({
                        embeds: [quoteErrorEmbed('That source is not valid')],
                    });
                }
            },
        },
    ],
    subcommandGroups: [
        {
            name: 'alias',
            description: 'Manage quote aliases',
            subcommands: [
                {
                    name: 'set',
                    description: 'Add or change the alias for a quote',
                    options: [
                        {
                            name: 'number',
                            description: 'Quote number set the alias for',
                            type: 'integer',
                            required: true,
                        },
                        {
                            type: 'string',
                            name: 'alias',
                            description: 'The desired alias',
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
                    name: 'remove',
                    description: 'Remove an alias from a quote',
                    options: [
                        {
                            name: 'number',
                            description: 'Quote number remove an alias from',
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
            ],
        },
    ],
});

export default quoteCommand;

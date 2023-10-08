import { SlashCommand, createSlashCommand } from './SlashCommand';

const quote: SlashCommand = createSlashCommand({
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
                    required: true,
                },
                {
                    type: 'string',
                    name: 'alias',
                    description: 'Alias of the desired quote',
                },
            ],
            run: async (interaction) => {
                await interaction.reply('found your quote');
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
                await interaction.reply('quote added');
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
                await interaction.reply('quote deleted');
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
                await interaction.reply('quote edited');
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
                await interaction.reply('search results');
            },
        },
        {
            name: 'latest',
            description: 'Get the most recent quote',
            run: async (interaction) => {
                await interaction.reply('latest quote');
            },
        },
    ],
});

export default quote;

import { SlashCommand, createSlashCommand } from './SlashCommand';

const quote: SlashCommand = {
    data: createSlashCommand({
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
            },
            {
                name: 'latest',
                description: 'Get the most recent quote',
            },
        ],
    }),
    run: async (interaction) => {
        interaction.reply('did the thing');
    },
};

export default quote;

import { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from './SlashCommand';
import { logError } from '../../../Logger';
import quoteCommand from './Quote';

export const commandList: SlashCommand[] = [];
const commandMap: Map<string, SlashCommand> = new Map();
const commandHandlers: Map<
    string,
    (interaction: ChatInputCommandInteraction) => void
> = new Map();

export const registerCommand = (command: SlashCommand) => {
    commandList.push(command);
    commandMap.set(command.data.name, command);
    commandHandlers.set(command.data.name, command.run);
};

export const commandCount = () => commandList.length;

export const getCommand = (name: string) => commandMap.get(name);

export const getHandler = (name: string) => {
    const handler = commandHandlers.get(name);
    if (handler) {
        return handler;
    }
    return (interaction: ChatInputCommandInteraction) => {
        logError(
            `Received interaction for unregistered command ${name}. Discord is probably out of sync with local data`,
        );
        interaction.reply({
            content:
                "That isn't a real command. I don't know how you did it, but you broke it. Good job.",
            ephemeral: true,
        });
    };
};

registerCommand(quoteCommand);

import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from './SlashCommand';
import { logError } from '../../../Logger';

const commandList: Command[] = [];
const commandMap: Map<string, Command> = new Map();
const commandHandlers: Map<
    string,
    (interaction: ChatInputCommandInteraction) => void
> = new Map();

export const registerCommand = (command: Command) => {
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
            `Received interaction for unregistered command ${name}. Discord is probably out of date with local data`,
        );
        interaction.reply({
            content:
                "That isn't a real command. I don't know how you did it, but you broke it. Good job.",
            ephemeral: true,
        });
    };
};

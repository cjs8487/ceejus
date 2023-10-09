/* eslint-disable no-console */
import {
    APIApplicationCommand,
    REST,
    RESTPostAPIApplicationCommandsJSONBody,
    Routes,
} from 'discord.js';
import {
    discordClientId,
    discordCommandGuild,
    discordToken,
} from '../Environment';
import { commandList } from '../discord/interactions/commands/SlashCommandList';

const rest = new REST().setToken(discordToken);

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
commandList.forEach((command) => {
    commands.push(command.data.toJSON());
});

(async () => {
    try {
        console.log(
            `Started refreshing ${commandList.length} application commands.`,
        );

        const data = (await rest.put(
            Routes.applicationGuildCommands(
                discordClientId,
                discordCommandGuild,
            ),
            { body: commands },
        )) as APIApplicationCommand[];

        console.log(
            `Successfully reloaded ${data.length} application commands.`,
        );
    } catch (error) {
        console.error(error);
    }
})();

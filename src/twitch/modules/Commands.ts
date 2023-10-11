import _ from 'lodash';
import { db } from '../../System';
import { HandlerDelegate } from '../../modules/Modules';
import { TwitchModule } from './TwitchModule';

const paramRegex = /(?:\$param(?<index>\d*))/g;

const handleCommand: HandlerDelegate = async (
    commandParts: string[],
    sender: string,
) => {
    // standard text commands
    const commandName = commandParts.shift();
    const response = db
        .prepare('select output from commands where command_string=?')
        .get(commandName);
    if (response === undefined) return undefined; // invalid command
    // technical note - earlier versions of the bot returned an empty string on a failed command lookup, since this
    // handler was the last resort for command messages, and an empty string would cause the bot to just not resposnd
    // However, with the new module system, multiple modules can handle an arbitrary subset of commands, and therefore
    // we need to continue even after failing to handle arbitary commands in a given module. We now use undefined to
    // indicate to the parent handler that we did not handle the the command and it should continue to look for
    // another handler for it.
    //
    // parse argument based commands
    let success = true;
    const parsed = response.output.replaceAll(
        paramRegex,
        (match: string, p1: string) => {
            if (p1 === 'undefined') {
                success = false;
            }
            return commandParts[_.toNumber(p1) + 1];
        },
    );
    if (success) {
        return parsed;
    }
    return `@${sender} incorrect syntax for command ${commandName}`;
};

const commandHandlers = new Map<string, HandlerDelegate>();

const commandsModule: TwitchModule = {
    name: 'Commands',
    key: 'commands',
    supportsArbitraryCommands: true,
    arbitraryDelegate: handleCommand,
    commandHandlers,
};

export default commandsModule;

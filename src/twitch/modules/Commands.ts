import _ from 'lodash';
import { db } from '../../System';
import { HandlerDelegate } from '../../modules/Modules';
import { TwitchModule } from './TwitchModule';
import { replyTo } from '../TwitchUtils';
import { getUserByName } from '../../database/Users';
import { Module, isModuleEnabled } from '../../database/Config';

const paramRegex = /(?:\$param(?<index>\d*))/g;

const handleCommand: HandlerDelegate = async (
    commandParts: string[],
    sender: string,
    mod,
    ...metadata
) => {
    // standard text commands
    const commandName = commandParts.shift();
    const [channel] = metadata;
    const owner = getUserByName(channel)?.userId;
    if (!owner) {
        return 'Data for this channel could not be found. The channel owner may need to reauthenticate.';
    }
    if (!isModuleEnabled(owner, Module.Quotes)) return undefined;
    const response = db
        .prepare('select * from commands where command_string=? and owner=?')
        .get(commandName, owner);
    if (response === undefined) return undefined; // invalid command
    if (!response.active) return ''; // valid, but disabled command
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
            const paramValue = commandParts[_.toNumber(p1)];
            if (!paramValue) {
                success = false;
            }
            return paramValue;
        },
    );
    if (success) {
        return parsed;
    }
    return `@${sender} incorrect syntax for !${commandName}`;
};

const handleCommandMod: HandlerDelegate = async (
    commandParts,
    user,
    mod,
    ...metadata
) => {
    if (!mod) return '';
    const [channel] = metadata;
    const owner = getUserByName(channel)?.userId;
    if (!owner) {
        return 'Data for this channel could not be found. The channel owner may need to reauthenticate.';
    }
    const action = commandParts.shift();
    const command = commandParts.shift()?.toLowerCase();
    if (!command) return '';
    if (action === 'add') {
        const output = commandParts.join(' ');
        db.prepare(
            'insert into commands (command_string, output, owner) values (?, ?, ?)',
        ).run(command, output, owner);
        return `command !${command} successfully created`;
    }
    if (action === 'edit') {
        const output = commandParts.join(' ');
        db.prepare(
            'update commands set output=? where command_string=? and owner=?',
        ).run(output, command, owner);
        return `!${command} edited successfully`;
    }
    if (action === 'delete') {
        db.prepare(
            'delete from commands where command_string=? and owner=?',
        ).run(command, owner);
        return `!${command} deleted sucessfully`;
    }
    if (action === 'enable') {
        db.prepare(
            'update commands set active=1 where command_string=? and owner=?',
        ).run(command, owner);
        return `!${command} is now enabled`;
    }
    if (action === 'disable') {
        db.prepare(
            'update commands set active=0 where command_string=? and owner=?',
        ).run(command, owner);
        return `!${command} is now disabled`;
    }
    return '';
};

const commandHandlers = new Map<string, HandlerDelegate>();
commandHandlers.set('commands', replyTo(handleCommandMod));

const commandsModule: TwitchModule = {
    name: 'Commands',
    key: 'commands',
    supportsArbitraryCommands: true,
    arbitraryDelegate: handleCommand,
    commandHandlers,
};

export default commandsModule;
